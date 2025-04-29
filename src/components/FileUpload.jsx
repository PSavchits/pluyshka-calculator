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

            // Обрабатываем каждый лист (группу) в файле
            workbook.SheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];

                // Получаем данные, начиная с D8 до первой пустой ячейки
                let row = 8; // Начинаем с 8-й строки
                const students = [];

                while (true) {
                    const cellAddress = `D${row}`;
                    const cell = worksheet[cellAddress];

                    // Если ячейка пустая или не существует - заканчиваем обработку
                    if (!cell || !cell.v || String(cell.v).trim() === '') {
                        break;
                    }

                    students.push({
                        groupName: sheetName, // Название группы = имя листа
                        fullName: String(cell.v).trim(),
                    });

                    row++;
                }

                if (students.length > 0) {
                    allStudents.push(...students);
                    console.log(`Группа ${sheetName}: загружено ${students.length} студентов`);
                }
            });

            if (allStudents.length === 0) {
                alert('Не найдено данных о студентах');
                return;
            }

            await saveStudents(allStudents);
            alert(`Успешно загружено ${allStudents.length} студентов из ${workbook.SheetNames.length} групп`);
            onDone?.(allStudents);
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