import React, { useEffect, useState } from 'react';
import { getStudentsBySearch, updateStudentEvaluation, getAllGroups } from '../utils/db';
import * as XLSX from 'xlsx';
import DayFormEvaluation from './DayFormEvaluation';
import RemoteFormEvaluation from './RemoteFormEvaluation';
import SandboxCalculation from "./SandboxCalculation";
import ResearchBlock from "./ResearchForm";

const CalculationForm = () => {
    const [group, setGroup] = useState('');
    const [groups, setGroups] = useState([]);
    const [fullNamePrefix, setFullNamePrefix] = useState('');
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState('Дневная');
    const [result, setResult] = useState(null);
    const [showSandbox, setShowSandbox] = useState(false);

    const [skips, setSkips] = useState(0);
    const [labCount, setLabCount] = useState(0);
    const [labs, setLabs] = useState([]);
    const [testCount, setTestCount] = useState(0);
    const [tests, setTests] = useState([]);
    const [hasNotebook, setHasNotebook] = useState(false);
    const [showResearchBlock, setShowResearchBlock] = useState(false);
    const [urgentPublication, setUrgentPublication] = useState(false);
    const [reports, setReports] = useState([]);

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

    const handleCalculate = () => {
        let baseScore = 0;

        // 1. Исключаем лабораторные по отчетам
        const excludedLabs = new Set();
        reports.forEach(report => {
            if (report.removedLabs && Array.isArray(report.removedLabs)) {
                report.removedLabs.forEach(i => excludedLabs.add(i));
            }
        });

        // 2. Проверка на недопуск: есть лабораторные < 3 (и не исключены)
        const failedLabs = labs
            .map((val, i) => ({ val: Number(val), index: i + 1 }))
            .filter(({ val, index }) => val < 3 && !excludedLabs.has(index - 1));

        if (failedLabs.length > 0) {
            setResult(`Студент не допущен к экзамену (не сданы: ${failedLabs.map(l => l.index).join(', ')})`);
            return;
        }

        // 3. Лабораторные
        const actualLabScores = labs.filter((_, i) => !excludedLabs.has(i));
        const labScoreAvg = actualLabScores.length > 0
            ? actualLabScores.reduce((sum, val) => sum + val, 0) / actualLabScores.length
            : 0;
        baseScore += labScoreAvg;

        // 4. Тесты
        const testAvg = tests.length > 0
            ? tests.reduce((sum, val) => sum + val, 0) / tests.length
            : 0;
        baseScore += testAvg / 2;

        // 5. Конспект
        if (hasNotebook) baseScore += 1;

        // 6. Пропуски (не влияют на допуск, только на балл)
        baseScore -= Math.floor(skips / 6);

        // 7. Научные работы
        let researchPoints = 0;

        if (urgentPublication) {
            baseScore = 8;
        }

        reports.forEach(report => {
            switch (report.mode) {
                case 'points':
                    baseScore += 1;
                    break;
                case '2points':
                    baseScore += 2;
                    break;
                case '1point_1lab':
                    baseScore += 1;
                    break;
            }

            if (baseScore >= 10) {
                if (report.mode === 'points') researchPoints += 1;
                if (report.mode === '2points') researchPoints += 2;
                if (report.mode === '1point_1lab') researchPoints += 1;
            }
        });

        if (baseScore > 10) baseScore = 10;

        setResult(baseScore);
    };

    const handleSave = async () => {
        if (!selected) return;

        const updated = await updateStudentEvaluation(
            selected.id,
            0, 0, 0,
            form
        );

        alert(`Сохранено: ${updated.fullName} — Оценка: ${result}`);
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
                            setResult(s.result ?? null);

                            setSkips(0);
                            setLabCount(0);
                            setLabs([]);
                            setTestCount(0);
                            setTests([]);
                            setHasNotebook(false);
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
                    <h4>Оценка для: {selected.fullName}</h4>
                    <select
                        value={form}
                        onChange={(e) => setForm(e.target.value)}
                    >
                        <option value="Дневная">Дневная</option>
                        <option value="ДО">ДО</option>
                    </select>

                    {form === 'Дневная' ? (
                        <>
                            <DayFormEvaluation
                                skips={skips}
                                setSkips={setSkips}
                                labCount={labCount}
                                setLabCount={setLabCount}
                                labs={labs}
                                setLabs={setLabs}
                                testCount={testCount}
                                setTestCount={setTestCount}
                                tests={tests}
                                setTests={setTests}
                                hasNotebook={hasNotebook}
                                setHasNotebook={setHasNotebook}
                                onCalculate={handleCalculate}
                            />

                            <div style={{ marginTop: '1rem' }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={showResearchBlock}
                                        onChange={(e) => setShowResearchBlock(e.target.checked)}
                                    />
                                    Учитывать научные работы
                                </label>

                                {showResearchBlock && (
                                    <ResearchBlock
                                        reports={reports}
                                        setReports={setReports}
                                        urgentPublication={urgentPublication}
                                        setUrgentPublication={setUrgentPublication}
                                        labCount={labCount}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <RemoteFormEvaluation
                            firstDigit={0}
                            setFirstDigit={() => {}}
                            secondDigit={0}
                            setSecondDigit={() => {}}
                            onCalculate={handleCalculate}
                        />
                    )}

                    {result !== null && (
                        <div>
                            <p>Результат: {result}</p>
                            <button onClick={handleSave}>Сохранить</button>
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
