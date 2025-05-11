import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getAllGroups, getStudentsByGroup } from '../service/db';

const ExportGroupData = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

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

    // Загрузка студентов при изменении выбранной группы (для отображения количества)
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
            return groupStudents; // Возвращаем загруженных студентов
        } catch (error) {
            console.error('Ошибка загрузки студентов:', error);
            setStudents([]);
            return []; // Возвращаем пустой массив в случае ошибки
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        if (!selectedGroup) {
            alert('Выберите группу для экспорта');
            return;
        }

        setIsExporting(true);
        try {
            // Загружаем студентов перед экспортом (перезагружаем, даже если уже загружены)
            const currentStudents = await loadStudents(selectedGroup);

            if (currentStudents.length === 0) {
                alert('Нет данных для экспорта');
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

            XLSX.utils.book_append_sheet(workbook, worksheet, selectedGroup);
            XLSX.writeFile(workbook, `Результаты_${selectedGroup}_${new Date().toISOString().slice(0,10)}.xlsx`);
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            alert('Произошла ошибка при экспорте данных');
        } finally {
            setIsExporting(false);
        }
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
                    disabled={isLoading || isExporting}
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
                className={`export-button ${isLoading || isExporting ? 'loading' : ''}`}
                onClick={handleExport}
                disabled={!selectedGroup || isLoading || isExporting}
            >
                {isExporting ? 'Экспортируется...' : isLoading ? 'Загрузка...' : 'Экспорт в Excel'}
            </button>
        </div>
    );
};

export default ExportGroupData;