import React, { useState, useEffect } from 'react';
import AttendanceBlock from './blocks/AttendanceBlock';
import ScienceBlock from './blocks/ScienceBlock';
import PresentationBlock from './blocks/PresentationBlock';
import BonusDistribution from './blocks/BonusDistribution';
import '../../styles/sandbox.css';

const SandboxCalculation = ({ show, onClose }) => {
    const [formType, setFormType] = useState('Дневная');
    const [labs, setLabs] = useState(['', '', '', '']);
    const [tests, setTests] = useState(['', '', '']);
    const [writtenWorks, setWrittenWorks] = useState('');
    const [publishedWorks, setPublishedWorks] = useState('');
    const [oralReports, setOralReports] = useState('');
    const [urgentPublications, setUrgentPublications] = useState('');
    const [awards, setAwards] = useState('');
    const [presentations, setPresentations] = useState('');
    const [voicedPresentations, setVoicedPresentations] = useState('');
    const [skippedHours, setSkippedHours] = useState('');
    const [notesVolume, setNotesVolume] = useState('');
    const [closedLabs, setClosedLabs] = useState('');
    const [bonusPoints, setBonusPoints] = useState('');
    const [result, setResult] = useState(null);

    const parseValue = (value) => value === '' ? 0 : Math.min(10, Math.max(0, Number(value) || 0));
    useEffect(() => {
        if(formType === 'Дневная') {
            setLabs(['', '', '', '']);
            setTests(['', '', '']);
        } else {
            setLabs(['', '']);
            setTests([]);
        }
        setClosedLabs('');
        setBonusPoints('');
        setResult(null);
    }, [formType]);

    const calculateResult = () => {
        let score = 0;

        const parsedLabs = labs.map(parseValue);
        const parsedTests = formType === 'Дневная' ? tests.map(parseValue) : [];
        const parsedSkipped = parseValue(skippedHours);
        const parsedNotes = parseValue(notesVolume);
        const parsedClosedLabs = parseValue(closedLabs);
        const parsedBonus = parseValue(bonusPoints);
        const parsedUrgent = parseValue(urgentPublications);

        if(formType === 'Дневная') {
            const skipPenalty = Math.floor(parsedSkipped / 2) * 0.5;
            const notesBonus = parsedNotes >= 70 ? 1 : 0;
            const activeLabsCount = 4 - Math.min(parsedClosedLabs, 4);
            const activeLabs = parsedLabs.slice(0, activeLabsCount);

            const labAvg = activeLabsCount > 0
                ? activeLabs.reduce((a, b) => a + b, 0) / activeLabsCount
                : 0;

            const testAvg = parsedTests.reduce((a, b) => a + b, 0) / 3;

            score = (labAvg + testAvg) / 2 + notesBonus - skipPenalty;
            if(parsedUrgent > 0) score = Math.max(score, 8);
            score += parsedBonus;
        } else {
            const labAvg = parsedLabs.reduce((a, b) => a + b, 0) / 2;
            score = labAvg + parsedBonus;
            if(parsedUrgent > 0) score = Math.max(score, 8);
        }

        setResult(Math.min(Math.max(score, 0), 10).toFixed(1));
    };

    const handleReset = () => {
        setFormType('Дневная');
        setLabs(['', '', '', '']);
        setTests(['', '', '']);
        setWrittenWorks('');
        setPublishedWorks('');
        setOralReports('');
        setUrgentPublications('');
        setAwards('');
        setPresentations('');
        setVoicedPresentations('');
        setSkippedHours('');
        setNotesVolume('');
        setClosedLabs('');
        setBonusPoints('');
        setResult(null);
    };

    const handleArrayChange = (array, setter, index, value, max) => {
        const newArray = [...array];
        newArray[index] = value === '' ? '' : Math.min(max, Math.max(0, Number(value) || 0));
        setter(newArray);
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
                                        onChange={(e) =>
                                            handleArrayChange(labs, setLabs, index, e.target.value, 10)
                                        }
                                        onBlur={(e) => {
                                            if(e.target.value === '') {
                                                handleArrayChange(labs, setLabs, index, '0', 10);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>

                    {formType === 'Дневная' && (
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
                                            onChange={(e) =>
                                                handleArrayChange(tests, setTests, index, e.target.value, 10)
                                            }
                                            onBlur={(e) => {
                                                if(e.target.value === '') {
                                                    handleArrayChange(tests, setTests, index, '0', 10);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    {formType === 'Дневная' && (
                        <AttendanceBlock
                            skippedHours={skippedHours}
                            setSkippedHours={setSkippedHours}
                            notesVolume={notesVolume}
                            setNotesVolume={setNotesVolume}
                        />
                    )}

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

                    <BonusDistribution
                        totalBonuses={parseValue(publishedWorks) + parseValue(oralReports) + parseValue(awards) + parseValue(presentations) + parseValue(voicedPresentations)}
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