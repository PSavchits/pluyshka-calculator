import React, {useEffect, useState} from 'react';
import {getAllGroups, getStudentsByGroup} from '../utils/db';
import * as XLSX from 'xlsx';

const ExportGroup = () => {
    const [group, setGroup] = React.useState('');
    const [groups, setGroups] = React.useState([]);

    React.useEffect(() => {
        const fetchGroups = async () => {
            const allGroups = await getAllGroups();
            setGroups(allGroups);
        };
        fetchGroups();
    }, []);

    const handleExport = async () => {
        if (!group) {
            alert('Выберите или введите номер группы');
            return;
        }
        const students = await getStudentsByGroup(group);
        if (students.length === 0) {
            alert('Нет учащихся в данной группе');
            return;
        }
        const exportData = students.map(({fullName, groupName, firstDigit, secondDigit, result}) => ({
            fullName,
            groupName,
            firstDigit,
            secondDigit,
            result
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GroupExport");
        XLSX.writeFile(workbook, `group_${group}_students.xlsx`);
    };

    return (
        <div>
            <h3>Экспорт учащихся по группе</h3>
            <div>
                <label>Группа: </label>
                <input
                    type="text"
                    list="group-options-export"
                    placeholder="Введите или выберите"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                />
                <datalist id="group-options-export">
                    {groups.map((g, i) => (
                        <option key={i} value={g}/>
                    ))}
                </datalist>
            </div>
            <button onClick={handleExport}> Экспортировать в Excel</button>
        </div>
    );
};

export default ExportGroup;
