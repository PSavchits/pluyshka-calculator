import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getAllGroups, getStudentsByGroup } from '../utils/db';

const ExportGroupData = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Загрузка всех групп при монтировании
    useEffect(() => {
        const loadGroups = async () => {
            const allGroups = await getAllGroups();
            setGroups(allGroups);
            if (allGroups.length > 0) {
                setSelectedGroup(allGroups[0]);
            }
        };
        loadGroups();
    }, []);

    // Загрузка студентов при изменении выбранной группы
    useEffect(() => {
        if (selectedGroup) {
            loadStudents(selectedGroup);
        }
    }, [selectedGroup]);

    const loadStudents = async (groupName) => {
        setIsLoading(true);
        try {
            const groupStudents = await getStudentsByGroup(groupName);
            setStudents(groupStudents);
        } catch (error) {
            console.error('Ошибка загрузки студентов:', error);
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        if (!selectedGroup || students.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }

        const exportData = students.map(student => ({
            'ФИО': student.fullName || 'Не указано',
            'Группа': student.groupName,
            'Первичный балл': student.rawScore ?? 0,
            'Итоговый балл': student.finalScore ?? 0,
            'Остаток плюшек': student.bonusBalance ?? 0,
            'Статус': student.status || 'Активен',
            'Форма обучения': student.form || 'Дневная'
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        worksheet['!cols'] = [
            { width: 30 }, { width: 15 }, { width: 15 },
            { width: 15 }, { width: 18 }, { width: 12 }, { width: 15 }
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, selectedGroup);
        XLSX.writeFile(workbook, `Результаты_${selectedGroup}_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    return (
        <div className="export-container">
            <h3>Экспорт данных группы</h3>

            <div className="input-group">
                <label>Группа:</label>
                <input
                    type="text"
                    list="group-options"
                    placeholder="Введите или выберите группу"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    disabled={isLoading}
                />
                <datalist id="group-options">
                    {groups.map((group, index) => (
                        <option key={index} value={group} />
                    ))}
                </datalist>
            </div>

            <div className="export-info">
                {selectedGroup && (
                    <p>Найдено студентов: {students.length}</p>
                )}
            </div>

            <button
                className={`export-button ${isLoading ? 'loading' : ''}`}
                onClick={handleExport}
                disabled={!selectedGroup || students.length === 0 || isLoading}
            >
                {isLoading ? 'Загрузка...' : 'Экспорт в Excel'}
            </button>
        </div>
    );
};

export default ExportGroupData;