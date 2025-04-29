import React, {useMemo, useState} from 'react';
import {updateStudentEvaluation} from '../../utils/db';
import AttendanceBlock from './blocks/AttendanceBlock';
import ScienceBlock from './blocks/ScienceBlock';
import PresentationBlock from './blocks/PresentationBlock';
import BonusDistribution from './blocks/BonusDistribution';

const DayForm = ({student, onStudentUpdate}) => {
    // Состояния для основных данных
    const [skippedHours, setSkippedHours] = useState(student.skippedHours || 0);
    const [notesVolume, setNotesVolume] = useState(student.notesVolume || 0);
    const [labs, setLabs] = useState(student.labs || [0, 0, 0, 0]);
    const [tests, setTests] = useState(student.tests || [0, 0, 0]);

    // Состояния для научной деятельности
    const [writtenWorks, setWrittenWorks] = useState(student.writtenWorks || 0);
    const [publishedWorks, setPublishedWorks] = useState(student.publishedWorks || 0);
    const [oralReports, setOralReports] = useState(student.oralReports || 0);
    const [urgentPublications, setUrgentPublications] = useState(student.urgentPublications || 0);
    const [awards, setAwards] = useState(student.awards || 0);

    // Состояния для презентаций
    const [presentations, setPresentations] = useState(student.presentations || 0);
    const [voicedPresentations, setVoicedPresentations] = useState(student.voicedPresentations || 0);

    // Состояния расчета
    const [calculationStep, setCalculationStep] = useState('initial');
    const [baseScore, setBaseScore] = useState(student.baseScore || 0);
    const [closedLabs, setClosedLabs] = useState(student.closedLabs || 0);
    const [bonusPoints, setBonusPoints] = useState(student.bonusPoints || 0);
    const [isSaving, setIsSaving] = useState(false);

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
        const skipPenalty = Math.floor(Number(skippedHours) / 2) * 0.5;
        const notesBonus = Number(notesVolume) >= 70 ? 1 : 0;
        const labAvg = labs.reduce((sum, val) => sum + Number(val), 0) / 4;
        const testAvg = tests.reduce((sum, val) => sum + Number(val), 0) / 3;

        score = (labAvg + testAvg) / 2;
        score += notesBonus;
        score -= skipPenalty;

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

        let labAvg;
        if (actualClosedLabs === 4) {
            labAvg = 10;
        } else {
            const activeLabsCount = 4 - actualClosedLabs;
            const activeLabs = labs.slice(0, activeLabsCount);
            const labSum = activeLabs.reduce((sum, val) => sum + Number(val), 0);
            labAvg = activeLabsCount > 0 ? labSum / activeLabsCount : 0;
        }

        const testAvg = tests.reduce((sum, val) => sum + Number(val), 0) / 3;
        let score = (labAvg + testAvg) / 2 + notesBonus - skipPenalty;

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

    // Сохранение данных с улучшенной обработкой
    const handleSave = async () => {
        setIsSaving(true);

        try {
            const finalScore = calculateFinalScore();
            const evaluationData = {
                skippedHours: Number(skippedHours),
                notesVolume: Number(notesVolume),
                labs: labs.map(Number),
                tests: tests.map(Number),
                writtenWorks: Number(writtenWorks),
                publishedWorks: Number(publishedWorks),
                oralReports: Number(oralReports),
                urgentPublications: Number(urgentPublications),
                awards: Number(awards),
                presentations: Number(presentations),
                voicedPresentations: Number(voicedPresentations),
                closedLabs: Number(closedLabs),
                bonusPoints: Number(bonusPoints),
                baseScore: calculateBaseScore(),
                result: finalScore,
                lastUpdated: new Date().toISOString()
            };

            const updatedStudent = await updateStudentEvaluation(student.id, evaluationData);

            if (updatedStudent) {
                alert(`Данные студента ${updatedStudent.fullName} успешно сохранены!\nИтоговая оценка: ${finalScore.toFixed(1)}`);
                onStudentUpdate?.(); // Обновляем родительский компонент
            } else {
                throw new Error('Не удалось сохранить данные');
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert(`Ошибка при сохранении: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="day-form">
            <h2>Оценка для {student.fullName}</h2>

            {calculationStep === 'initial' ? (
                <>
                    <AttendanceBlock {...{skippedHours, setSkippedHours, notesVolume, setNotesVolume}} />

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
                                            newLabs[index] = Math.max(0, Math.min(10, Number(e.target.value) || 0));
                                            setLabs(newLabs);
                                        }}
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
                                        min="0"
                                        max="10"
                                        value={test}
                                        onChange={e => {
                                            const newTests = [...tests];
                                            newTests[index] = Math.max(0, Math.min(10, Number(e.target.value) || 0));
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
        </div>
    );
};

export default DayForm;