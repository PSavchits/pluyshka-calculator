import React, { useEffect, useState } from 'react';
import { getStudentsBySearch, getAllGroups } from '../utils/db';
import * as XLSX from 'xlsx';
import DayForm from './DayForm';
import RemoteForm from './RemoteForm';
import SandboxCalculation from "./SandboxCalculation";

const CalculationForm = () => {
    const [group, setGroup] = useState('');
    const [groups, setGroups] = useState([]);
    const [fullNamePrefix, setFullNamePrefix] = useState('');
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState('Дневная');
    const [showSandbox, setShowSandbox] = useState(false);

    useEffect(() => {
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

    const handleExport = () => {
        const filtered = results.map(({ fullName, groupName, result, form }) => ({
            fullName,
            groupName,
            form,
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
                        <option key={i} value={g} />
                    ))}
                </datalist>
                <input
                    type="text"
                    placeholder="ФИО (начало)"
                    value={fullNamePrefix}
                    onChange={(e) => setFullNamePrefix(e.target.value)}
                />
                <button onClick={handleSearch}>Найти</button>
            </div>

            <ul>
                {results.map((s) => (
                    <li
                        key={s.id}
                        onClick={() => {
                            setSelected(s);
                            setForm(s.form ?? 'Дневная');
                        }}>
                        {`${s.fullName} (Группа: ${s.groupName})`}
                    </li>
                ))}
            </ul>

            {results.length > 0 && (
                <button onClick={handleExport}>Экспортировать группу</button>
            )}

            <button onClick={() => setShowSandbox(true)}>Песочница расчёта</button>

            {selected && (
                <div>
                    <select
                        value={form}
                        onChange={(e) => setForm(e.target.value)}
                    >
                        <option value="Дневная">Дневная</option>
                        <option value="ДО">ДО</option>
                    </select>

                    {form === 'Дневная' ? (
                        <DayForm student={selected} />
                    ) : (
                        <RemoteForm student={selected} />
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