import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveStudents } from '../service/db';
import '../styles/upload.css';

const FileUpload = ({ onDone }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [startRow, setStartRow] = useState(8);
    const [startColumn, setStartColumn] = useState('D');

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setNotification({
                type: 'error',
                title: 'Ошибка',
                content: 'Пожалуйста, выберите файл Excel'
            });
            return;
        }

        setIsLoading(true);
        setNotification(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const allStudents = [];

            workbook.SheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                let row = startRow;
                const students = [];

                while (true) {
                    const cellAddress = `${startColumn}${row}`;
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
                setNotification({
                    type: 'error',
                    title: 'Ошибка загрузки',
                    content: 'Не найдено данных о студентах'
                });
                return;
            }

            await saveStudents(allStudents);

            setNotification({
                type: 'success',
                title: 'Успешная загрузка!',
                content: `Загружено ${allStudents.length} студентов из ${workbook.SheetNames.length} групп`
            });

            setTimeout(() => {
                setNotification(null);
                onDone?.(allStudents);
                window.location.reload();
            }, 4000);

        } catch (error) {
            console.error('Ошибка обработки файла:', error);
            setNotification({
                type: 'error',
                title: 'Ошибка обработки',
                content: error.message || 'Произошла ошибка при обработке файла'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="file-upload-wrapper">
            <h3>Загрузка списка учащихся</h3>
            <p>Настройте параметры чтения данных из файла</p>

            <div className="upload-config">
                <div className="config-item">
                    <label htmlFor="startColumn">Начальный столбец:</label>
                    <input
                        id="startColumn"
                        type="text"
                        value={startColumn}
                        onChange={(e) => setStartColumn(e.target.value.toUpperCase())}
                        maxLength={1}
                        placeholder="D"
                    />
                </div>
                <div className="config-item">
                    <label htmlFor="startRow">Начальная строка:</label>
                    <input
                        id="startRow"
                        type="number"
                        value={startRow}
                        onChange={(e) => setStartRow(parseInt(e.target.value) || 8)}
                        min={1}
                        placeholder="8"
                    />
                </div>
            </div>

            <input
                id="fileInput"
                type="file"
                className="file-upload-input"
                accept=".xlsx, .xls"
                onChange={handleFile}
                disabled={isLoading}
            />

            <label
                htmlFor="fileInput"
                className={`file-upload-label ${isLoading ? 'file-selected' : ''}`}
            >
                {isLoading ? (
                    <>
                        <span className="loading-spinner" />
                        <span>Обработка...</span>
                    </>
                ) : (
                    <>
                        <span className="file-icon">📁</span>
                        <span>Выбрать файл</span>
                    </>
                )}
            </label>

            {notification && (
                <div className={`notification ${notification.type}`}>
                    <div className="notification-icon">
                        {notification.type === 'success' ? '✓' : '⚠'}
                    </div>
                    <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.content}</p>
                    </div>
                    <button
                        className="notification-close"
                        onClick={() => setNotification(null)}
                        aria-label="Закрыть уведомление"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;