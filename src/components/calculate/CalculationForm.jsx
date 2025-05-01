import React, { useEffect, useState } from 'react';
import { getStudentsBySearch, getAllGroups } from '../../utils/db';
import * as XLSX from 'xlsx';
import DayForm from './DayForm';
import RemoteForm from './RemoteForm';
import SandboxCalculation from "./SandboxCalculation";
import '../../styles/dayform.css';

const CalculationForm = () => {
    const [group, setGroup] = useState('');
    const [groups, setGroups] = useState([]);
    const [fullNamePrefix, setFullNamePrefix] = useState('');
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [formType, setFormType] = useState('Дневная');
    const [showSandbox, setShowSandbox] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const allGroups = await getAllGroups();
                setGroups(allGroups);
            } catch (error) {
                setNotification({
                    type: 'error',
                    title: '⛔ Ошибка загрузки',
                    content: 'Не удалось загрузить список групп'
                });
            }
        };
        fetchGroups();
    }, []);

    const handleSearch = async () => {
        try {
            setSelected(null);
            const students = await getStudentsBySearch(group, fullNamePrefix);
            setResults(students);

            if (students.length === 0) {
                setNotification({
                    type: 'info',
                    title: 'Ничего не найдено',
                    content: 'Студенты по вашему запросу не найдены'
                });
            }
        } catch (error) {
            setNotification({
                type: 'error',
                title: '⛔ Ошибка поиска',
                content: error.message || 'Не удалось выполнить поиск'
            });
        } finally {
            setTimeout(() => setNotification(null), 5000);
        }
    };

    const handleExport = () => {
        try {
            const currentStudents = results.map(({fullName, groupName, finalMark}) => ({
                fullName,
                groupName,
                finalMark
            }));

            if (currentStudents.length === 0) {
                setNotification({
                    type: 'error',
                    title: '🚫 Нет данных',
                    content: 'Нет данных для экспорта'
                });
                return;
            }

            const exportData = currentStudents.map(student => ({
                'ФИО': student.fullName || 'Не указано',
                'Группа': student.groupName,
                'Итоговый балл': student.finalMark ?? 0,
            }));

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            worksheet['!cols'] = [
                { width: 30 }, { width: 15 }, { width: 15 }
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
            XLSX.writeFile(workbook, `Результаты_${group}_${new Date().toISOString().slice(0,10)}.xlsx`);

            setNotification({
                type: 'success',
                title: '✅ Экспорт завершен',
                content: `Успешно экспортировано ${currentStudents.length} записей`
            });
        } catch (error) {
            setNotification({
                type: 'error',
                title: '⛔ Ошибка экспорта',
                content: error.message || 'Не удалось экспортировать данные'
            });
        } finally {
            setTimeout(() => setNotification(null), 5000);
        }
    };

    return (
        <div className="calculation-container">
            {/* Система уведомлений */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    <div className="notification-icon">
                        {notification.type === 'success' ? '✔️'
                            : notification.type === 'error' ? '⚠️'
                                : 'ℹ️'}
                    </div>
                    <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <div className="notification-message">
                            {notification.content}
                        </div>
                    </div>
                    <button
                        className="notification-close"
                        onClick={() => setNotification(null)}
                        aria-label="Закрыть уведомление"
                    >
                        &times;
                    </button>
                </div>
            )}

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
                            Экспортировать студентов
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