import React, { useState, useEffect } from 'react';
import { updateStudentEvaluation } from '../utils/db';
import AttendanceBlock from './AttendanceBlock';
import ScienceBlock from './ScienceBlock';
import PresentationBlock from './PresentationBlock';

const DayForm = ({ student }) => {
    const [result, setResult] = useState(student.result ?? null);

    //Посещаемость
    const [skippedHours, setSkippedHours] = useState(0);
    const [notesVolume, setNotesVolume] = useState(0);
    const [labs, setLabs] = useState([0, 0, 0, 0]);
    const [tests, setTests] = useState([0, 0, 0]);
    const [closedLabs, setClosedLabs] = useState(0);

    // Научная деятельность
    const [writtenWorks, setWrittenWorks] = useState(0);
    const [publishedWorks, setPublishedWorks] = useState(0);
    const [oralReports, setOralReports] = useState(0);
    const [urgentPublications, setUrgentPublications] = useState(0);
    const [awards, setAwards] = useState(0);

    // Презентации
    const [presentations, setPresentations] = useState(0);
    const [voicedPresentations, setVoicedPresentations] = useState(0);

    useEffect(() => {
        calculateResult();
    }, [skippedHours, notesVolume, labs, tests, closedLabs,
        writtenWorks, publishedWorks, oralReports, urgentPublications,
        awards, presentations, voicedPresentations]);

    const calculateResult = () => {
        // Шаг 1: Рассчитываем штраф за пропуски
        const skipPenalty = Math.floor(skippedHours / 2) * 0.5;

        // Шаг 2: Бонус за конспект
        const notesBonus = notesVolume >= 70 ? 1 : 0;

        // Шаг 3: Рассчитываем доступные бонусы
        const scienceBonuses = publishedWorks + oralReports + awards;
        const presentationBonuses = presentations + voicedPresentations;
        const totalBonus = scienceBonuses + presentationBonuses;

        // Шаг 4: Определяем сколько лаб можно закрыть
        const maxClosableLabs = Math.min(totalBonus - closedLabs, 4);
        const actualClosedLabs = Math.min(closedLabs, maxClosableLabs);

        // Шаг 5: Пересчитываем средние оценки
        const activeLabs = 4 - actualClosedLabs;
        const labSum = labs.slice(0, 4 - actualClosedLabs).reduce((a, b) => a + b, 0);
        const labAvg = activeLabs > 0 ? labSum / activeLabs : 0;

        const testAvg = tests.reduce((a, b) => a + b, 0) / 3;

        // Шаг 6: Общее среднее
        let total = (labAvg + testAvg) / 2;
        total += notesBonus;
        total -= skipPenalty;

        // Шаг 7: Учет срочных публикаций
        if(urgentPublications > 0 && total < 8) {
            total = 8;
        }

        // Шаг 8: Добавляем оставшиеся бонусы
        const remainingBonuses = totalBonus - actualClosedLabs;
        total += remainingBonuses;

        // Ограничение максимальной оценки
        total = Math.min(Math.max(total, 0), 10);
        setResult(total.toFixed(1));
    };

    const handleSave = async () => {
        const data = {
            skippedHours,
            notesVolume,
            labs,
            tests,
            closedLabs,
            writtenWorks,
            publishedWorks,
            oralReports,
            urgentPublications,
            awards,
            presentations,
            voicedPresentations,
            result
        };

        const updated = await updateStudentEvaluation(
            student.id,
            data
        );
        alert(`Сохранено: ${updated.fullName} — Оценка: ${result}`);
    };

    return (
        <div className="day-form">
            <h2>Оценка для {student.fullName}</h2>

            {/* Блок посещаемости */}
            <AttendanceBlock
                skippedHours={skippedHours}
                setSkippedHours={setSkippedHours}
                notesVolume={notesVolume}
                setNotesVolume={setNotesVolume}
            />

            {/* Блок отметок */}
            <div className="section">
                <h3>Лабораторные работы</h3>
                {labs.map((lab, index) => (
                    <label key={index}>
                        Лабораторная {index + 1}:
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={lab}
                            onChange={e => {
                                const newLabs = [...labs];
                                newLabs[index] = Math.max(0, Math.min(10, parseInt(e.target.value) || 0));
                                setLabs(newLabs);
                            }}
                        />
                    </label>
                ))}

                <h3>Тесты</h3>
                {tests.map((test, index) => (
                    <label key={index}>
                        Тест {index + 1}:
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={test}
                            onChange={e => {
                                const newTests = [...tests];
                                newTests[index] = Math.max(0, Math.min(10, parseInt(e.target.value) || 0));
                                setTests(newTests);
                            }}
                        />
                    </label>
                ))}
            </div>

            {/* Научная деятельность */}
            <ScienceBlock
                writtenWorks={writtenWorks}
                setWrittenWorks={setWrittenWorks}
                publishedWorks={publishedWorks}
                setPublishedWorks={setPublishedWorks}
                oralReports={oralReports}
                setOralReports={setOralReports}
                urgentPublications={urgentPublications}
                setUrgentPublications={setUrgentPublications}
                awards={awards}
                setAwards={setAwards}
            />

            {/* Презентации */}
            <PresentationBlock
                presentations={presentations}
                setPresentations={setPresentations}
                voicedPresentations={voicedPresentations}
                setVoicedPresentations={setVoicedPresentations}
            />

            {/* Управление бонусами */}
            <div className="section">
                <h3>Распределение бонусов</h3>
                <label>
                    Закрыть лабораторных работ:
                    <input
                        type="number"
                        min="0"
                        max="4"
                        value={closedLabs}
                        onChange={e => setClosedLabs(Math.max(0, Math.min(4, parseInt(e.target.value) || 0)))}
                    />
                </label>
            </div>

            {result !== null && (
                <div className="result-section">
                    <h3>Итоговая оценка: {result}</h3>
                    <button onClick={handleSave}>Сохранить оценку</button>
                </div>
            )}
        </div>
    );
};

export default DayForm;