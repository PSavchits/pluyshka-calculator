import React, { useState, useEffect } from 'react';
import AttendanceBlock from './blocks/AttendanceBlock';
import ScienceBlock from './blocks/ScienceBlock';
import PresentationBlock from './blocks/PresentationBlock';
import BonusDistribution from './blocks/BonusDistribution';
import '../../styles/sandbox.css';

const SandboxCalculation = ({ show, onClose }) => {
    const [formType, setFormType] = useState('Дневная');
    const [labCount, setLabCount] = useState(4);
    const [testCount, setTestCount] = useState(3);
    const [labs, setLabs] = useState(Array(4).fill(''));
    const [tests, setTests] = useState(Array(3).fill(''));
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
            setLabCount(4);
            setTestCount(3);
            setLabs(Array(4).fill(''));
            setTests(Array(3).fill(''));
        } else {
            setLabCount(2);
            setTestCount(0);
            setLabs(Array(2).fill(''));
            setTests([]);
        }
        setClosedLabs('');
        setBonusPoints('');
        setResult(null);
    }, [formType]);

    const handleLabCountChange = (newCount) => {
        const count = Math.max(1, Math.min(10, parseInt(newCount) || 1));
        setLabCount(count);
        const newLabs = [...labs];
        if (count > labs.length) {
            newLabs.push(...Array(count - labs.length).fill(''));
        } else {
            newLabs.splice(count);
        }
        setLabs(newLabs);
    };

    const handleTestCountChange = (newCount) => {
        const count = Math.max(0, Math.min(10, parseInt(newCount) || 0));
        setTestCount(count);
        const newTests = [...tests];
        if (count > tests.length) {
            newTests.push(...Array(count - tests.length).fill(''));
        } else {
            newTests.splice(count);
        }
        setTests(newTests);
    };

    const calculateResult = () => {
        let score = 0;

        const parsedLabs = labs.map(parseValue);
        const parsedTests = tests.map(parseValue);
        const parsedSkipped = parseValue(skippedHours);
        const parsedNotes = parseValue(notesVolume);
        const parsedClosedLabs = parseValue(closedLabs);
        const parsedBonus = parseValue(bonusPoints);
        const parsedUrgent = parseValue(urgentPublications);

        if(formType === 'Дневная') {
            const skipPenalty = Math.floor(parsedSkipped / 2) * 0.5;
            const notesBonus = parsedNotes >= 70 ? 1 : 0;
            const activeLabsCount = labCount - Math.min(parsedClosedLabs, labCount);
            const activeLabs = parsedLabs.slice(0, activeLabsCount);

            const labAvg = activeLabsCount > 0
                ? activeLabs.reduce((a, b) => a + b, 0) / activeLabsCount
                : 0;

            const testAvg = testCount > 0 
                ? parsedTests.reduce((a, b) => a + b, 0) / testCount 
                : 0;

            score = testCount > 0 
                ? (labAvg + testAvg) / 2 + notesBonus - skipPenalty
                : labAvg + notesBonus - skipPenalty;

            if(parsedUrgent > 0) score = Math.max(score, 8);
            score += parsedBonus;
        } else {
            const labAvg = parsedLabs.reduce((a, b) => a + b, 0) / labCount;
            const testAvg = testCount > 0 
                ? parsedTests.reduce((a, b) => a + b, 0) / testCount 
                : 0;

            score = testCount > 0 
                ? (labAvg + testAvg) / 2 + parsedBonus
                : labAvg + parsedBonus;

            if(parsedUrgent > 0) score = Math.max(score, 8);
        }

        setResult(Math.min(Math.max(score, 0), 10).toFixed(1));
    };

    const handleReset = () => {
        setFormType('Дневная');
        setLabCount(4);
        setTestCount(3);
        setLabs(Array(4).fill(''));
        setTests(Array(3).fill(''));
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
                        <div className="input-group">
                            <label>Количество лабораторных:
                                <input
                                    type="number"
                                    className="no-spin"
                                    min="1"
                                    max="10"
                                    value={labCount}
                                    onChange={(e) => handleLabCountChange(e.target.value)}
                                />
                            </label>
                        </div>
                        {labs.slice(0, labCount).map((lab, index) => (
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

                    <div className="section">
                        <h3>Тесты</h3>
                        <div className="input-group">
                            <label>Количество тестов:
                                <input
                                    type="number"
                                    className="no-spin"
                                    min="0"
                                    max="10"
                                    value={testCount}
                                    onChange={(e) => handleTestCountChange(e.target.value)}
                                />
                            </label>
                        </div>
                        {tests.slice(0, testCount).map((test, index) => (
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