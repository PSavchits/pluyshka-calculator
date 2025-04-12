import React, {useEffect, useState} from 'react';
import {getStudentsBySearch, updateStudentEvaluation, getAllGroups} from '../utils/db';
import * as XLSX from 'xlsx';
import DayFormEvaluation from './DayFormEvaluation';
import RemoteFormEvaluation from './RemoteFormEvaluation';
import SandboxCalculation from "./SandboxCalculation";

const CalculationForm = () => {
    const [group, setGroup] = React.useState('');
    const [groups, setGroups] = React.useState([]);
    const [fullNamePrefix, setFullNamePrefix] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [selected, setSelected] = React.useState(null);
    const [firstDigit, setFirstDigit] = React.useState('');
    const [secondDigit, setSecondDigit] = React.useState('');
    const [thirdDigit, setThirdDigit] = React.useState('');
    const [form, setForm] = React.useState('Дневная');
    const [result, setResult] = React.useState(null);
    const [showSandbox, setShowSandbox] = React.useState(false);

    React.useEffect(() => {
        const fetchGroups = async () => {
            const allGroups = await getAllGroups();
            setGroups(allGroups);
        };
        fetchGroups();
    }, []);

    const handleSearch = async () => {
        setSelected(null);
        const students = await getStudentsBySearch(group, fullNamePrefix);
        setResults(students);
    };

    const handleCalculate = () => {
        let res = 0;
        if (form === 'Дневная') {
            res = Number(firstDigit) + Number(secondDigit) + Number(thirdDigit || 0);
        } else {
            res = Number(firstDigit) + Number(secondDigit) - 1;
        }
        setResult(res);
    };

    const handleSave = async () => {
        if (!selected) return;
        const updated = await updateStudentEvaluation(
            selected.id,
            Number(firstDigit),
            Number(secondDigit),
            Number(thirdDigit || 0),
            form
        );
        alert(`Сохранено: ${updated.fullName} — Оценка: ${updated.result}`);
    };

    const handleExport = () => {
        const filtered = results.map(({fullName, groupName, firstDigit, secondDigit, thirdDigit, result, form}) => ({
            fullName,
            groupName,
            form,
            firstDigit,
            secondDigit,
            thirdDigit,
            result,
        }));
        const worksheet = XLSX.utils.json_to_sheet(filtered);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        XLSX.writeFile(workbook, `group_${group}_students.xlsx`);
    };

    return (
        <div>
            <h3>Поиск учащегося</h3>
            <div>
                <div>
                    <label>Группа: </label>
                    <input
                        type="text"
                        list="group-options"
                        placeholder="Введите или выберите"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                    />
                    <datalist id="group-options">
                        {groups.map((g, i) => (
                            <option key={i} value={g}/>
                        ))}
                    </datalist>
                </div>
                <input
                    type="text"
                    placeholder="ФИО (начало)"
                    value={fullNamePrefix}
                    onChange={(e) => setFullNamePrefix(e.target.value)}
                />
                <button onClick={handleSearch}> Найти</button>
            </div>

            <ul>
                {results.map((s) => (
                    <li
                        key={s.id}
                        onClick={() => {
                            setSelected(s);
                            setFirstDigit(s.firstDigit ?? '');
                            setSecondDigit(s.secondDigit ?? '');
                            setThirdDigit(s.thirdDigit ?? '');
                            setForm(s.form ?? 'Дневная');
                            setResult(s.result ?? null);
                        }}>
                        {`${s.fullName} (Группа: ${s.groupName})`}
                    </li>
                ))}
            </ul>

            {results.length > 0 && (
                <button onClick={handleExport}> Экспортировать группу </button>
            )}

            <button onClick={() => setShowSandbox(true)}>
                Песочница расчёта
            </button>

            {selected && (
                <div>
                    <h4>Оценка для: {selected.fullName}</h4>
                    <select
                        value={form}
                        onChange={(e) => setForm(e.target.value)}
                    >
                        <option value="Дневная">Дневная</option>
                        <option value="ДО">ДО</option>
                    </select>
                    {form === 'Дневная' ? (
                        <DayFormEvaluation
                            firstDigit={firstDigit}
                            setFirstDigit={setFirstDigit}
                            secondDigit={secondDigit}
                            setSecondDigit={setSecondDigit}
                            thirdDigit={thirdDigit}
                            setThirdDigit={setThirdDigit}
                            onCalculate={handleCalculate}
                        />
                    ) : (
                        <RemoteFormEvaluation
                            firstDigit={firstDigit}
                            setFirstDigit={setFirstDigit}
                            secondDigit={secondDigit}
                            setSecondDigit={setSecondDigit}
                            onCalculate={handleCalculate}
                        />
                    )}
                    {result !== null && (
                        <div>
                            <p>Результат: {result}</p>
                            <button onClick={handleSave}>
                                Сохранить
                            </button>
                        </div>
                    )}
                </div>
            )}

            <SandboxCalculation
                show={showSandbox}
                onClose={() => setShowSandbox(false)}
            />
        </div>
    );
};

export default CalculationForm;
