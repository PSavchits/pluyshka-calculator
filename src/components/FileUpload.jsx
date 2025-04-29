import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveStudents } from '../utils/db';

const FileUpload = ({ onDone }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            alert('Выберите файл Excel');
            return;
        }

        setIsLoading(true);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const allStudents = [];

            workbook.SheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                let row = 8;
                const students = [];

                while (true) {
                    const cellAddress = `D${row}`;
                    const cell = worksheet[cellAddress];

                    if (!cell || !cell.v || String(cell.v).trim() === '') {
                        break;
                    }

                    students.push({
                        groupName: sheetName,
                        fullName: String(cell.v).trim(),
                    });

                    row++;
                }

                if (students.length > 0) {
                    allStudents.push(...students);
                }
            });

            if (allStudents.length === 0) {
                alert('Не найдено данных о студентах');
                return;
            }

            await saveStudents(allStudents);
            alert(`Успешно загружено ${allStudents.length} студентов из ${workbook.SheetNames.length} групп`);

            // Вызываем callback если он есть
            onDone?.(allStudents);

            // Перезагружаем страницу через 1 секунду после алерта
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Ошибка обработки файла:', error);
            alert('Произошла ошибка при обработке файла');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3>Загрузка списка учащихся</h3>
            <p>Файл должен содержать листы с названиями групп, списки начинаются с ячейки D8</p>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFile}
                disabled={isLoading}
            />
            {isLoading && <p>Загрузка и обработка файла...</p>}
        </div>
    );
};

export default FileUpload;