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
    const [formType, setFormType] = useState('Дневная');
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
        <div className="calculation-container">
            <div className="search-section">
                <h3>Поиск учащегося</h3>
                <div className="search-controls">
                    <div className="input-group">
                        <label>Группа:</label>
                        <input
                            type="text"
                            list="group-options"
                            placeholder="Введите или выберите группу"
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                        />
                        <datalist id="group-options">
                            {groups.map((g, i) => (
                                <option key={i} value={g} />
                            ))}
                        </datalist>
                    </div>

                    <div className="input-group">
                        <label>ФИО:</label>
                        <input
                            type="text"
                            placeholder="Начните вводить ФИО"
                            value={fullNamePrefix}
                            onChange={(e) => setFullNamePrefix(e.target.value)}
                        />
                    </div>

                    <button
                        className="search-button"
                        onClick={handleSearch}
                    >
                        Найти
                    </button>
                </div>
            </div>

            {results.length > 0 && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Найденные студенты:</h4>
                        <button
                            className="export-button"
                            onClick={handleExport}
                        >
                            Экспортировать группу
                        </button>
                    </div>

                    <ul className="students-list">
                        {results.map((s) => (
                            <li
                                key={s.id}
                                className="student-item"
                                onClick={() => {
                                    setSelected(s);
                                    setFormType(s.form ?? 'Дневная');
                                }}
                            >
                                {`${s.fullName} (${s.groupName})`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selected && (
                <div className="evaluation-section">
                    <div className="form-selector">
                        <label>Форма обучения:</label>
                        <select
                            value={formType}
                            onChange={(e) => setFormType(e.target.value)}
                        >
                            <option value="Дневная">Дневная</option>
                            <option value="ДО">Дистанционная</option>
                        </select>
                    </div>

                    {formType === 'Дневная' ? (
                        <DayForm
                            student={selected}
                            onStudentUpdate={() => handleSearch()}
                        />
                    ) : (
                        <RemoteForm
                            student={selected}
                            onStudentUpdate={() => handleSearch()}
                        />
                    )}
                </div>
            )}

            <div className="sandbox-section">
                <button
                    className="sandbox-button"
                    onClick={() => setShowSandbox(true)}
                >
                    Открыть песочницу
                </button>
            </div>

            <SandboxCalculation
                show={showSandbox}
                onClose={() => setShowSandbox(false)}
            />
        </div>
    );
};

export default CalculationForm;