import React, { useMemo, useState } from 'react';
import { updateStudentEvaluation } from '../utils/db';
import ScienceBlock from './ScienceBlock';
import PresentationBlock from './PresentationBlock';
import BonusDistribution from './BonusDistribution';

const RemoteForm = ({ student }) => {
    // Состояния для лабораторных работ
    const [labs, setLabs] = useState([0, 0]);

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
    const [bonusPoints, setBonusPoints] = useState(0);

    // Мемоизированные бонусы
    const { scienceBonuses, presentationBonuses, totalBonuses } = useMemo(() => {
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
        // Средняя оценка за лабораторные
        const labAvg = labs.reduce((sum, val) => sum + Number(val), 0) / 2;

        // Базовый расчет
        let score = labAvg;

        // Учет срочных публикаций
        if (Number(urgentPublications) > 0) {
            score = Math.max(score, 8);
        }

        return Math.min(Math.max(score, 0), 10);
    };

    // Расчет итогового балла
    const calculateFinalScore = () => {
        const labAvg = labs.reduce((sum, val) => sum + Number(val), 0) / 2;
        let score = labAvg + Number(bonusPoints);

        // Учет срочных публикаций
        if (Number(urgentPublications) > 0) {
            score = Math.max(score, 8);
        }

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
            labs,
            writtenWorks,
            publishedWorks,
            oralReports,
            urgentPublications,
            awards,
            presentations,
            voicedPresentations,
            bonusPoints,
            result: finalScore,
            form: 'ДО'
        };

        const updated = await updateStudentEvaluation(student.id, data);
        alert(`Сохранено: ${updated.fullName} — Оценка: ${finalScore.toFixed(1)}`);
    };

    return (
        <div className="remote-form">
            <h2>Оценка для {student.fullName} (Дистанционная форма)</h2>

            {calculationStep === 'initial' ? (
                <>
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