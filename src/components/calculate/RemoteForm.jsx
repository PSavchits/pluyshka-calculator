import React, { useMemo, useState } from 'react';
import { updateStudentEvaluation } from '../../utils/db';
import ScienceBlock from './blocks/ScienceBlock';
import PresentationBlock from './blocks/PresentationBlock';
import BonusDistribution from './blocks/BonusDistribution';
import '../../styles/dayform.css';

const RemoteForm = ({ student }) => {
    // Состояния с пустыми строками вместо 0
    const [labs, setLabs] = useState(['', '']);
    const [writtenWorks, setWrittenWorks] = useState('');
    const [publishedWorks, setPublishedWorks] = useState('');
    const [oralReports, setOralReports] = useState('');
    const [urgentPublications, setUrgentPublications] = useState('');
    const [awards, setAwards] = useState('');
    const [presentations, setPresentations] = useState('');
    const [voicedPresentations, setVoicedPresentations] = useState('');
    const [calculationStep, setCalculationStep] = useState('initial');
    const [baseScore, setBaseScore] = useState(0);
    const [bonusPoints, setBonusPoints] = useState('');
    const [notification, setNotification] = useState(null);

    // Парсинг значений с учетом пустых строк
    const parseValue = (value) => {
        if (value === '') return 0;
        const num = Number(value);
        return Math.min(10, Math.max(0, isNaN(num) ? 0 : num));
    };

    const { scienceBonuses, presentationBonuses, totalBonuses } = useMemo(() => {
        const sci = parseValue(publishedWorks) + parseValue(oralReports) + parseValue(awards);
        const pres = parseValue(presentations) + parseValue(voicedPresentations);
        return {
            scienceBonuses: sci,
            presentationBonuses: pres,
            totalBonuses: sci + pres
        };
    }, [publishedWorks, oralReports, awards, presentations, voicedPresentations]);

    const calculateBaseScore = () => {
        const parsedLabs = labs.map(parseValue);
        const labAvg = parsedLabs.reduce((sum, val) => sum + val, 0) / 2;
        let score = labAvg;
        if (parseValue(urgentPublications) > 0) score = Math.max(score, 8);
        return Math.min(Math.max(score, 0), 10);
    };

    const calculateFinalScore = () => {
        const parsedLabs = labs.map(parseValue);
        const labAvg = parsedLabs.reduce((sum, val) => sum + val, 0) / 2;
        let score = labAvg + parseValue(bonusPoints);
        if (parseValue(urgentPublications) > 0) score = Math.max(score, 8);
        return Math.min(Math.max(score, 0), 10);
    };

    const handleInitialCalculation = () => {
        setBaseScore(calculateBaseScore());
        setCalculationStep('distribution');
    };

    const handleLabChange = (index, value) => {
        const newValue = value === '' ? '' : Math.max(0, Math.min(10, Number(value)));
        const newLabs = [...labs];
        newLabs[index] = newValue;
        setLabs(newLabs);
    };

    const handleSave = async () => {
        const finalScore = calculateFinalScore();
        const updated = await updateStudentEvaluation(student.id, finalScore);
        alert(`Сохранено: ${updated.fullName} — Оценка: ${finalScore.toFixed(1)}`);
    };

    return (
        <div className="remote-form">
            <h2>Оценка для {student.fullName} (Дистанционная форма)</h2>

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

            {calculationStep === 'initial' ? (
                <>
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
                                        onBlur={e => {
                                            if (e.target.value === '') {
                                                handleLabChange(index, '0');
                                            }
                                        }}
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

                    <button className="calculate-btn" onClick={handleInitialCalculation}>
                        Перейти к распределению бонусов
                    </button>
                </>
            ) : (
                <>
                    <div className="score-summary">
                        <h3>Базовый балл: {baseScore.toFixed(1)}</h3>
                        <div className="bonus-info">
                            <p>Доступные бонусы: {totalBonuses}</p>
                        </div>
                    </div>

                    <BonusDistribution
                        totalBonuses={totalBonuses}
                        bonusPoints={bonusPoints}
                        setBonusPoints={setBonusPoints}
                        isRemote={true}
                    />

                    <div className="final-score">
                        <h3>Итоговая оценка: {calculateFinalScore().toFixed(1)}</h3>
                        <div className="controls">
                            <button className="save-btn" onClick={handleSave}>
                                Сохранить
                            </button>
                            <button
                                className="edit-btn"
                                onClick={() => setCalculationStep('initial')}
                            >
                                Изменить данные
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RemoteForm;