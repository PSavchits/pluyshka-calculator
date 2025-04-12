import React, {useState} from 'react';
import * as XLSX from 'xlsx';
import {saveStudents} from '../utils/db';

const FileUpload = ({onDone}) => {
    const [groupName, setGroupName] = React.useState('');

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file || !groupName.trim()) {
            alert('Введите номер группы и выберите файл');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: '',
            });
            const cleaned = rawData
                .flat()
                .filter((v) => v.trim().length > 0);
            const students = cleaned.map((fullName) => ({
                groupName,
                fullName,
            }));
            await saveStudents(students);
            alert(`Загружено студентов: ${students.length}`);
            onDone?.(students);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div>
            <h3>Загрузка списка учащихся</h3>
            <input
                type="text"
                placeholder="Введите номер группы"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
            />
            <input type="file" accept=".xlsx, .xls" onChange={handleFile}/>
        </div>
    );
};

export default FileUpload;
