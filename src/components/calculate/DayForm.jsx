import React, {useMemo, useState} from 'react';
import {updateStudentEvaluation} from '../../utils/db';
import AttendanceBlock from './blocks/AttendanceBlock';
import ScienceBlock from './blocks/ScienceBlock';
import PresentationBlock from './blocks/PresentationBlock';
import BonusDistribution from './blocks/BonusDistribution';

const DayForm = ({student}) => {
    // Состояния для основных данных
    const [skippedHours, setSkippedHours] = useState(0);
    const [notesVolume, setNotesVolume] = useState(0);
    const [labs, setLabs] = useState([0, 0, 0, 0]);
    const [tests, setTests] = useState([0, 0, 0]);

    // Состояния для научной деятельности
    const [writtenWorks, setWrittenWorks] = useState(0);
    const [publishedWorks, setPublishedWorks] = useState(0);
    const [oralReports, setOralReports] = useState(0);
    const [urgentPublications, setUrgentPublications] = useState(0);
    const [awards, setAwards] = useState(0);

    // Состояния для презентаций
    const [presentations, setPresentations] = useState(0);
    const [voicedPresentations, setVoicedPresentations] = useState(0);

    // Состояния расчета
    const [calculationStep, setCalculationStep] = useState('initial');
    const [baseScore, setBaseScore] = useState(0);
    const [closedLabs, setClosedLabs] = useState(0);
    const [bonusPoints, setBonusPoints] = useState(0);

    // Мемоизированные бонусы
    const {scienceBonuses, presentationBonuses, totalBonuses} = useMemo(() => {
        const sci = publishedWorks + oralReports + awards;
        const pres = presentations + voicedPresentations;
        return {
            scienceBonuses: sci,
            presentationBonuses: pres,
            totalBonuses: sci + pres
        };
    }, [publishedWorks, oralReports, awards, presentations, voicedPresentations]);

    // Расчет базового балла
    const calculateBaseScore = () => {
        let score = 0;

        // 1. Штраф за пропуски (исправлено)
        const skipPenalty = Math.floor(Number(skippedHours) / 2) * 0.5;

        // 2. Бонус за конспект (исправлено)
        const notesBonus = Number(notesVolume) >= 70 ? 1 : 0;

        // 3. Средние оценки (добавлено преобразование типов)
        const labAvg = labs.reduce((sum, val) => sum + Number(val), 0) / 4;
        const testAvg = tests.reduce((sum, val) => sum + Number(val), 0) / 3;

        // 4. Базовый расчет
        score = (labAvg + testAvg) / 2;
        score += notesBonus;
        score -= skipPenalty;

        // 5. Учет срочных публикаций
        if (Number(urgentPublications) > 0) {
            score = Math.max(score, 8);
        }

        return Math.min(Math.max(score, 0), 10);
    };

    // Расчет итогового балла
    const calculateFinalScore = () => {

        const skipPenalty = Math.floor(Number(skippedHours) / 2) * 0.5;

        const notesBonus = Number(notesVolume) >= 70 ? 1 : 0;

        const actualClosedLabs = Math.min(closedLabs, 4);
        let activeLabsCount;
        let activeLabs;
        let labSum;
        let labAvg;

        if (actualClosedLabs === 4) {
            // Если закрыты все 4 лабораторные
            labAvg = 10;
        } else {
            activeLabsCount = 4 - actualClosedLabs;
            activeLabs = labs.slice(0, activeLabsCount);
            labSum = activeLabs.reduce((sum, val) => sum + Number(val), 0);
            labAvg = activeLabsCount > 0 ? labSum / activeLabsCount : 0;
        }

        const testAvg = tests.reduce((sum, val) => sum + Number(val), 0) / 3;

        let score = (labAvg + testAvg) / 2 + notesBonus - skipPenalty;

        // Учет срочных публикаций в финальной оценке
        if (Number(urgentPublications) > 0) {
            score = Math.max(score, 8);
        }

        score += Number(bonusPoints);

        return Math.min(Math.max(score, 0), 10);
    };

    // Инициализация расчета
    const handleInitialCalculation = () => {
        setBaseScore(calculateBaseScore());
        setCalculationStep('distribution');
    };

    // Сохранение данных
    const handleSave = async () => {
        const finalScore = calculateFinalScore();
        const data = {
            skippedHours,
            notesVolume,
            labs,
            tests,
            writtenWorks,
            publishedWorks,
            oralReports,
            urgentPublications,
            awards,
            presentations,
            voicedPresentations,
            closedLabs,
            bonusPoints,
            result: finalScore
        };

        const updated = await updateStudentEvaluation(student.id, data);
        alert(`Сохранено: ${updated.fullName} — Оценка: ${finalScore.toFixed(1)}`);
    };

    return (
        <div className="day-form">
            <h2>Оценка для {student.fullName}</h2>

            {calculationStep === 'initial' ? (
                <>
                    <AttendanceBlock {...{skippedHours, setSkippedHours, notesVolume, setNotesVolume}} />

                    {/* Блок лабораторных */}
                    <div className="section">
                        <h3>Лабораторные работы</h3>
                        {labs.map((lab, index) => (
                            <div className="input-group" key={index}>
                                <label>Лаб {index + 1}:
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
                            </div>
                        ))}
                    </div>

                    {/* Блок тестов */}
                    <div className="section">
                        <h3>Тесты</h3>
                        {tests.map((test, index) => (
                            <div className="input-group" key={index}>
                                <label>Тест {index + 1}:
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
                            </div>
                        ))}
                    </div>

                    <ScienceBlock {...{
                        writtenWorks, setWrittenWorks,
                        publishedWorks, setPublishedWorks,
                        oralReports, setOralReports,
                        urgentPublications, setUrgentPublications,
                        awards, setAwards
                    }} />

                    <PresentationBlock {...{
                        presentations, setPresentations,
                        voicedPresentations, setVoicedPresentations
                    }} />

                    <button
                        className="calculate-btn"
                        onClick={handleInitialCalculation}
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

                    <BonusDistribution {...{
                        totalBonuses,
                        closedLabs,
                        setClosedLabs,
                        bonusPoints,
                        setBonusPoints,
                        maxLabsToClose: 4
                    }} />

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

export default DayForm;