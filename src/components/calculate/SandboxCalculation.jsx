import React, { useState, useEffect } from 'react';
import AttendanceBlock from './blocks/AttendanceBlock';
import ScienceBlock from './blocks/ScienceBlock';
import PresentationBlock from './blocks/PresentationBlock';
import BonusDistribution from './blocks/BonusDistribution';

const SandboxCalculation = ({ show, onClose }) => {
    const [formType, setFormType] = useState('Дневная');

    // Общие состояния
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

    // Состояния для дневной формы
    const [skippedHours, setSkippedHours] = useState(0);
    const [notesVolume, setNotesVolume] = useState(0);
    const [closedLabs, setClosedLabs] = useState(0);

    // Состояния для расчета
    const [bonusPoints, setBonusPoints] = useState(0);
    const [result, setResult] = useState(null);

    // Сброс состояний при изменении типа формы
    useEffect(() => {
        setLabs(formType === 'Дневная' ? [0, 0, 0, 0] : [0, 0]);
        setClosedLabs(0);
        setBonusPoints(0);
        setResult(null);
    }, [formType]);

    const calculateResult = () => {
        let score = 0;

        // Общие параметры
        const sciBonus = publishedWorks + oralReports + awards;
        const presBonus = presentations + voicedPresentations;
        const totalBonuses = sciBonus + presBonus;

        if(formType === 'Дневная') {
            // Расчет для дневной формы
            const skipPenalty = Math.floor(skippedHours / 2) * 0.5;
            const notesBonus = notesVolume >= 70 ? 1 : 0;

            const activeLabsCount = 4 - Math.min(closedLabs, 4);
            const activeLabs = labs.slice(0, activeLabsCount);

            const labAvg = activeLabsCount > 0
                ? activeLabs.reduce((a, b) => a + b, 0) / activeLabsCount
                : 0;

            const testAvg = tests.reduce((a, b) => a + b, 0) / 3;

            score = (labAvg + testAvg) / 2 + notesBonus - skipPenalty;

            if(urgentPublications > 0) score = Math.max(score, 8);
            score += bonusPoints;

        } else {
            // Расчет для дистанционной формы
            const labAvg = labs.reduce((a, b) => a + b, 0) / 2;
            score = labAvg + bonusPoints;
            if(urgentPublications > 0) score = Math.max(score, 8);
        }

        setResult(Math.min(Math.max(score, 0), 10).toFixed(1));
    };

    const handleReset = () => {
        setFormType('Дневная');
        setLabs([0, 0, 0, 0]);
        setTests([0, 0, 0]);
        setWrittenWorks(0);
        setPublishedWorks(0);
        setOralReports(0);
        setUrgentPublications(0);
        setAwards(0);
        setPresentations(0);
        setVoicedPresentations(0);
        setSkippedHours(0);
        setNotesVolume(0);
        setClosedLabs(0);
        setBonusPoints(0);
        setResult(null);
    };

    if(!show) return null;

    return (
        <div className="sandbox-overlay">
            <div className="sandbox-modal">
                <div className="modal-header">
                    <h2>Песочница расчетов</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="form-control">
                    <label>Форма обучения:</label>
                    <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                    >
                        <option value="Дневная">Дневная</option>
                        <option value="ДО">Дистанционная</option>
                    </select>
                </div>

                <div className="sections-container">
                    {/* Блок лабораторных работ */}
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
                                        onChange={(e) => {
                                            const newLabs = [...labs];
                                            newLabs[index] = Math.max(0,
                                                Math.min(10, parseInt(e.target.value) || 0)
                                            );
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
                                        onChange={(e) => {
                                            const newTests = [...tests];
                                            newTests[index] = Math.max(0,
                                                Math.min(10, parseInt(e.target.value) || 0)
                                            );
                                            setTests(newTests);
                                        }}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Компоненты только для дневной формы */}
                    {formType === 'Дневная' && (
                        <AttendanceBlock
                            skippedHours={skippedHours}
                            setSkippedHours={setSkippedHours}
                            notesVolume={notesVolume}
                            setNotesVolume={setNotesVolume}
                        />
                    )}

                    {/* Общие компоненты */}
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

                    <PresentationBlock
                        presentations={presentations}
                        setPresentations={setPresentations}
                        voicedPresentations={voicedPresentations}
                        setVoicedPresentations={setVoicedPresentations}
                    />

                    {/* Распределение бонусов */}
                    <BonusDistribution
                        totalBonuses={publishedWorks + oralReports + awards + presentations + voicedPresentations}
                        closedLabs={formType === 'Дневная' ? closedLabs : 0}
                        setClosedLabs={formType === 'Дневная' ? setClosedLabs : () => {}}
                        bonusPoints={bonusPoints}
                        setBonusPoints={setBonusPoints}
                        maxLabsToClose={4}
                        isRemote={formType === 'ДО'}
                    />
                </div>

                <div className="result-section">
                    <h3>Результат: {result ?? '0.0'}</h3>
                    <div className="action-buttons">
                        <button className="calculate-btn" onClick={calculateResult}>
                            Рассчитать
                        </button>
                        <button className="reset-btn" onClick={handleReset}>
                            Сбросить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SandboxCalculation;