import React, { useMemo, useState } from 'react';
import { updateStudentEvaluation } from '../../utils/db';
import AttendanceBlock from './blocks/AttendanceBlock';
import ScienceBlock from './blocks/ScienceBlock';
import PresentationBlock from './blocks/PresentationBlock';
import BonusDistribution from './blocks/BonusDistribution';
import '../../styles/dayform.css';

const DayForm = ({ student, onStudentUpdate }) => {
    // Состояния с пустыми строками вместо 0
    const [skippedHours, setSkippedHours] = useState(student.skippedHours?.toString() || '');
    const [notesVolume, setNotesVolume] = useState(student.notesVolume?.toString() || '');
    const [labs, setLabs] = useState(student.labs?.map(String) || ['', '', '', '']);
    const [tests, setTests] = useState(student.tests?.map(String) || ['', '', '']);

    // Состояния для научной деятельности
    const [writtenWorks, setWrittenWorks] = useState(student.writtenWorks?.toString() || '');
    const [publishedWorks, setPublishedWorks] = useState(student.publishedWorks?.toString() || '');
    const [oralReports, setOralReports] = useState(student.oralReports?.toString() || '');
    const [urgentPublications, setUrgentPublications] = useState(student.urgentPublications?.toString() || '');
    const [awards, setAwards] = useState(student.awards?.toString() || '');

    // Состояния для презентаций
    const [presentations, setPresentations] = useState(student.presentations?.toString() || '');
    const [voicedPresentations, setVoicedPresentations] = useState(student.voicedPresentations?.toString() || '');

    // Состояния расчета
    const [calculationStep, setCalculationStep] = useState('initial');
    const [baseScore, setBaseScore] = useState(student.baseScore || 0);
    const [closedLabs, setClosedLabs] = useState(student.closedLabs?.toString() || '');
    const [bonusPoints, setBonusPoints] = useState(student.bonusPoints?.toString() || '');
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    // Парсинг значений с учетом пустых строк
    const parseValue = (value) => {
        if (value === '') return 0;
        const num = Number(value);
        return Math.min(10, Math.max(0, isNaN(num) ? 0 : num));
    };

    // Мемоизированные бонусы
    const { scienceBonuses, presentationBonuses, totalBonuses } = useMemo(() => {
        const sci = parseValue(publishedWorks) + parseValue(oralReports) + parseValue(awards);
        const pres = parseValue(presentations) + parseValue(voicedPresentations);
        return { scienceBonuses: sci, presentationBonuses: pres, totalBonuses: sci + pres };
    }, [publishedWorks, oralReports, awards, presentations, voicedPresentations]);

    // Обработчики изменений
    const handleLabChange = (index, value) => {
        const newValue = value === '' ? '' : Math.max(0, Math.min(10, Number(value)));
        const newLabs = [...labs];
        newLabs[index] = newValue.toString();
        setLabs(newLabs);
    };

    const handleTestChange = (index, value) => {
        const newValue = value === '' ? '' : Math.max(0, Math.min(10, Number(value)));
        const newTests = [...tests];
        newTests[index] = newValue.toString();
        setTests(newTests);
    };

    // Расчет базового балла
    const calculateBaseScore = () => {
        const skipPenalty = Math.floor(parseValue(skippedHours) / 2) * 0.5;
        const notesBonus = parseValue(notesVolume) >= 70 ? 1 : 0;
        const parsedLabs = labs.map(parseValue);
        const parsedTests = tests.map(parseValue);

        const labAvg = parsedLabs.reduce((sum, val) => sum + val, 0) / 4;
        const testAvg = parsedTests.reduce((sum, val) => sum + val, 0) / 3;

        let score = (labAvg + testAvg) / 2 + notesBonus - skipPenalty;

        if (parseValue(urgentPublications) > 0) {
            score = Math.max(score, 8);
        }

        return Math.min(Math.max(score, 0), 10);
    };

    // Расчет итогового балла
    const calculateFinalScore = () => {
        const skipPenalty = Math.floor(parseValue(skippedHours) / 2) * 0.5;
        const notesBonus = parseValue(notesVolume) >= 70 ? 1 : 0;
        const actualClosedLabs = Math.min(parseValue(closedLabs), 4);

        let labAvg;
        if (actualClosedLabs === 4) {
            labAvg = 10;
        } else {
            const activeLabsCount = 4 - actualClosedLabs;
            const activeLabs = labs.slice(0, activeLabsCount).map(parseValue);
            const labSum = activeLabs.reduce((sum, val) => sum + val, 0);
            labAvg = activeLabsCount > 0 ? labSum / activeLabsCount : 0;
        }

        const testAvg = tests.map(parseValue).reduce((sum, val) => sum + val, 0) / 3;
        let score = (labAvg + testAvg) / 2 + notesBonus - skipPenalty;

        if (parseValue(urgentPublications) > 0) {
            score = Math.max(score, 8);
        }

        score += parseValue(bonusPoints);

        return Math.min(Math.max(score, 0), 10);
    };

    // Инициализация расчета
    const handleInitialCalculation = () => {
        setBaseScore(calculateBaseScore());
        setCalculationStep('distribution');
    };

    // Сохранение данных
    const handleSave = async () => {
        setIsSaving(true);

        try {
            const finalScore = calculateFinalScore();
            const updatedStudent = await updateStudentEvaluation(student.id, finalScore);

            if (updatedStudent) {
                setNotification({
                    type: 'success',
                    title: '✅ Данные сохранены',
                    content: (
                        <>
                            Успешно сохранены данные для <strong>{updatedStudent.fullName}</strong>
                            <div style={{ marginTop: '8px' }}>
                                Итоговая оценка: <strong>{finalScore.toFixed(1)}</strong>
                            </div>
                        </>
                    )
                });
                setTimeout(() => setNotification(null), 5000);
                onStudentUpdate?.();
            }
        } catch (error) {
            setNotification({
                type: 'error',
                title: '⛔ Ошибка сохранения',
                content: error.message || 'Не удалось сохранить данные'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="day-form">
            <h2>Оценка для {student.fullName}</h2>

            {calculationStep === 'initial' ? (
                <>
                    <AttendanceBlock
                        skippedHours={skippedHours}
                        setSkippedHours={setSkippedHours}
                        notesVolume={notesVolume}
                        setNotesVolume={setNotesVolume}
                    />

                    <div className="section">
                        <h3>Лабораторные работы</h3>
                        {labs.map((lab, index) => (
                            <div className="input-group" key={index}>
                                <label>Лаб {index + 1}:
                                    <input
                                        type="number"
                                        className="no-spin"
                                        min="0"
                                        max="10"
                                        value={lab}
                                        onChange={e => handleLabChange(index, e.target.value)}
                                        onBlur={e => lab === '' && handleLabChange(index, '0')}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="section">
                        <h3>Тесты</h3>
                        {tests.map((test, index) => (
                            <div className="input-group" key={index}>
                                <label>Тест {index + 1}:
                                    <input
                                        type="number"
                                        className="no-spin"
                                        min="0"
                                        max="10"
                                        value={test}
                                        onChange={e => handleTestChange(index, e.target.value)}
                                        onBlur={e => test === '' && handleTestChange(index, '0')}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>

                    <ScienceBlock
                        inputClassName="no-spin"
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

                    <PresentationBlock
                        inputClassName="no-spin"
                        presentations={presentations}
                        setPresentations={setPresentations}
                        voicedPresentations={voicedPresentations}
                        setVoicedPresentations={setVoicedPresentations}
                    />

                    <button
                        className="calculate-btn"
                        onClick={handleInitialCalculation}
                        disabled={isSaving}
                    >
                        Перейти к распределению бонусов
                    </button>
                </>
            ) : (
                <>
                    <div className="score-summary">
                        <h3>Базовый балл: {baseScore.toFixed(1)}</h3>
                        <div className="bonus-info">
                            <p>Научные бонусы: {scienceBonuses}</p>
                            <p>Бонусы за презентации: {presentationBonuses}</p>
                            <p>Всего бонусов: {totalBonuses}</p>
                        </div>
                    </div>

                    <BonusDistribution
                        totalBonuses={totalBonuses}
                        closedLabs={closedLabs}
                        setClosedLabs={setClosedLabs}
                        bonusPoints={bonusPoints}
                        setBonusPoints={setBonusPoints}
                        maxLabsToClose={4}
                    />

                    <div className="final-score">
                        <h3>Итоговая оценка: {calculateFinalScore().toFixed(1)}</h3>
                        <div className="controls">
                            <button
                                className="save-btn"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            <button
                                className="edit-btn"
                                onClick={() => setCalculationStep('initial')}
                                disabled={isSaving}
                            >
                                Изменить данные
                            </button>
                        </div>
                    </div>
                </>
            )}

            {notification && (
                <div className={`notification ${notification.type}`}>
                    <div className="notification-icon">
                        {notification.type === 'success' ? '✔' : '⚠'}
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
        </div>
    );
};

export default DayForm;