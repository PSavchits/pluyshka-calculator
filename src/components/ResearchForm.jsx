import React from 'react';

const ResearchBlock = ({ reports, setReports, urgentPublication, setUrgentPublication, labCount }) => {
    const handleAddReport = (type) => {
        const newReport = {
            type,
            mode: type === 'Доклад' ? 'points' : '2points', // значение по умолчанию
            removedLabs: []
        };
        setReports([...reports, newReport]);
    };

    const handleModeChange = (index, mode) => {
        const updated = [...reports];
        updated[index].mode = mode;
        if (!mode.includes('lab')) {
            updated[index].removedLabs = [];
        }
        setReports(updated);
    };

    const handleLabToggle = (reportIndex, labIndex) => {
        const updated = [...reports];
        const current = updated[reportIndex];
        if (!current.removedLabs) current.removedLabs = [];

        if (current.removedLabs.includes(labIndex)) {
            current.removedLabs = current.removedLabs.filter(i => i !== labIndex);
        } else {
            current.removedLabs.push(labIndex);
        }

        setReports(updated);
    };

    const handleRemove = (index) => {
        const updated = [...reports];
        updated.splice(index, 1);
        setReports(updated);
    };

    return (
        <div style={{ marginTop: '1rem' }}>
            <h4>Научные работы</h4>

            <label>
                <input
                    type="checkbox"
                    checked={urgentPublication}
                    onChange={(e) => setUrgentPublication(e.target.checked)}
                />
                Срочная публикация (устанавливает оценку 8 при выполнении условий)
            </label>

            <div style={{ marginTop: '1rem' }}>
                <button onClick={() => handleAddReport('Доклад')}>Добавить доклад</button>
                <button onClick={() => handleAddReport('Доклад с выступлением')}>Добавить доклад с выступлением</button>
            </div>

            {reports.map((report, index) => (
                <div key={index} style={{ border: '1px solid #ccc', padding: '0.5rem', marginTop: '0.5rem' }}>
                    <strong>{report.type}</strong>
                    <button style={{ float: 'right' }} onClick={() => handleRemove(index)}>Удалить</button>

                    <div style={{ marginTop: '0.5rem' }}>
                        <label>Режим: </label>
                        {report.type === 'Доклад' && (
                            <select value={report.mode} onChange={(e) => handleModeChange(index, e.target.value)}>
                                <option value="points">+1 балл</option>
                                <option value="labs">-1 лабораторная</option>
                            </select>
                        )}
                        {report.type === 'Доклад с выступлением' && (
                            <select value={report.mode} onChange={(e) => handleModeChange(index, e.target.value)}>
                                <option value="2points">+2 балла</option>
                                <option value="1point_1lab">+1 балл и -1 лабораторная</option>
                                <option value="2labs">-2 лабораторные</option>
                            </select>
                        )}
                    </div>

                    {(report.mode.includes('lab')) && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <label>Исключить лабораторные: </label>
                            {[...Array(labCount).keys()].map((labIndex) => (
                                <label key={labIndex} style={{ marginRight: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={report.removedLabs.includes(labIndex)}
                                        onChange={() => handleLabToggle(index, labIndex)}
                                    />
                                    {labIndex + 1}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ResearchBlock;
