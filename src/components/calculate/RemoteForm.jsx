import React, {useMemo, useState} from 'react';
import {updateStudentEvaluation} from '../../service/db';
import ScienceBlock from './blocks/ScienceBlock';
import PresentationBlock from './blocks/PresentationBlock';
import BonusDistribution from './blocks/BonusDistribution';
import '../../styles/dayform.css';

const RemoteForm = ({student, onStudentUpdate}) => {
    const [labCount, setLabCount] = useState(student.labs?.length || 2);
    const [testCount, setTestCount] = useState(student.tests?.length || 0);
    const [labs, setLabs] = useState(student.labs?.map(String) || Array(2).fill(''));
    const [tests, setTests] = useState(student.tests?.map(String) || []);
    const [labPassed, setLabPassed] = useState(student.labs?.map(lab => lab >= 6) || Array(2).fill(false));
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
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    const parseValue = (value) => {
        if (value === '') return 0;
        const num = Number(value);
        return Math.min(10, Math.max(0, isNaN(num) ? 0 : num));
    };

    const {scienceBonuses, presentationBonuses, totalBonuses} = useMemo(() => {
        const sci = parseValue(publishedWorks) + parseValue(oralReports) + parseValue(awards);
        const pres = parseValue(presentations) + parseValue(voicedPresentations);
        return {
            scienceBonuses: sci,
            presentationBonuses: pres,
            totalBonuses: sci + pres
        };
    }, [publishedWorks, oralReports, awards, presentations, voicedPresentations]);

    const handleLabCountChange = (newCount) => {
        const count = Math.max(1, Math.min(10, parseInt(newCount) || 1));
        setLabCount(count);
        const newLabs = [...labs];
        const newLabPassed = [...labPassed];
        if (count > labs.length) {
            newLabs.push(...Array(count - labs.length).fill(''));
            newLabPassed.push(...Array(count - labPassed.length).fill(false));
        } else {
            newLabs.splice(count);
            newLabPassed.splice(count);
        }
        setLabs(newLabs);
        setLabPassed(newLabPassed);
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

    const handleLabChange = (index, value) => {
        const newLabPassed = [...labPassed];
        newLabPassed[index] = value === 'passed';
        setLabPassed(newLabPassed);
    };

    const handleTestChange = (index, value) => {
        const newValue = value === '' ? '' : Math.max(0, Math.min(10, Number(value)));
        const newTests = [...tests];
        newTests[index] = newValue;
        setTests(newTests);
    };

    const handleInitialCalculation = () => {
        setBaseScore(calculateBaseScore());
        setCalculationStep('distribution');
    };

    const calculateBaseScore = () => {
        const passedLabsCount = labPassed.filter(passed => passed).length;
        const labAvg = passedLabsCount > 0 ? (passedLabsCount * 6) / labCount : 0;
        const parsedTests = tests.map(parseValue);
        const testAvg = testCount > 0 ? parsedTests.reduce((sum, val) => sum + val, 0) / testCount : 0;
        
        let score = testCount > 0 ? (labAvg + testAvg) / 2 : labAvg;
        if (parseValue(urgentPublications) > 0) score = Math.max(score, 8);
        return Math.min(Math.max(score, 0), 10);
    };

    const calculateFinalScore = () => {
        const passedLabsCount = labPassed.filter(passed => passed).length;
        const labAvg = passedLabsCount > 0 ? (passedLabsCount * 6) / labCount : 0;
        const parsedTests = tests.map(parseValue);
        const testAvg = testCount > 0 ? parsedTests.reduce((sum, val) => sum + val, 0) / testCount : 0;
        
        let score = testCount > 0 ? (labAvg + testAvg) / 2 : labAvg;
        score += parseValue(bonusPoints);
        if (parseValue(urgentPublications) > 0) score = Math.max(score, 8);
        return Math.min(Math.max(score, 0), 10);
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const finalScore = calculateFinalScore();
            const data = {
                labs: labPassed.map(passed => passed ? 6 : 0),
                tests: tests.map(parseValue),
                writtenWorks: parseValue(writtenWorks),
                publishedWorks: parseValue(publishedWorks),
                oralReports: parseValue(oralReports),
                urgentPublications: parseValue(urgentPublications),
                awards: parseValue(awards),
                presentations: parseValue(presentations),
                voicedPresentations: parseValue(voicedPresentations),
                bonusPoints: parseValue(bonusPoints),
                baseScore: calculateBaseScore(),
                finalMark: finalScore,
                remainingBonuses: totalBonuses - parseValue(bonusPoints),
                scienceBonuses,
                presentationBonuses,
                totalBonuses,
                form: 'ДО',
                lastUpdated: new Date().toISOString()
            };

            const updated = await updateStudentEvaluation(student.id, data);

            if (updated) {
                setNotification({
                    type: 'success',
                    title: '✅ Данные сохранены',
                    content: (
                        <>
                            Успешно сохранены данные для <strong>{updated.fullName}</strong>
                            <div style={{marginTop: '8px'}}>
                                Итоговая оценка: <strong>{finalScore.toFixed(1)}</strong>
                                <br />
                                Оставшиеся бонусы: <strong>{data.remainingBonuses}</strong>
                            </div>
                        </>
                    )
                });
                setTimeout(() => {
                    setNotification(null);
                    onStudentUpdate?.();
                }, 2000);
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
                        <div className="input-group">
                            <label>Количество лабораторных:
                                <input
                                    type="number"
                                    className="no-spin"
                                    min="1"
                                    max="10"
                                    value={labCount}
                                    onChange={e => handleLabCountChange(e.target.value)}
                                />
                            </label>
                        </div>
                        {labs.slice(0, labCount).map((lab, index) => (
                            <div className="input-group" key={index}>
                                <label>Лаб {index + 1}:
                                    <select
                                        value={labPassed[index] ? 'passed' : 'failed'}
                                        onChange={e => handleLabChange(index, e.target.value)}
                                    >
                                        <option value="passed">Сдано</option>
                                        <option value="failed">Не сдано</option>
                                    </select>
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
                                    onChange={e => handleTestCountChange(e.target.value)}
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
                                        onChange={e => handleTestChange(index, e.target.value)}
                                        onBlur={e => {
                                            if (e.target.value === '') {
                                                handleTestChange(index, '0');
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

                    <button className="calculate-btn"
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
                            <button
                                className="save-btn"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                Сохранить
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

export default RemoteForm;