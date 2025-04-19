import React, { useState } from 'react';
import DayFormEvaluation from './DayFormEvaluation';
import ResearchBlock from './ResearchForm';

const SandboxCalculation = ({ show, onClose }) => {
    const [form, setForm] = useState('Дневная');
    const [result, setResult] = useState(null);

    const [skips, setSkips] = useState(0);
    const [labCount, setLabCount] = useState(0);
    const [labs, setLabs] = useState([]);
    const [testCount, setTestCount] = useState(0);
    const [tests, setTests] = useState([]);
    const [hasNotebook, setHasNotebook] = useState(false);

    const [showResearchBlock, setShowResearchBlock] = useState(false);
    const [urgentPublication, setUrgentPublication] = useState(false);
    const [reports, setReports] = useState([]);

    const handleCalculate = () => {
        let baseScore = 0;

        const excludedLabs = new Set();
        reports.forEach(report => {
            if (report.removedLabs && Array.isArray(report.removedLabs)) {
                report.removedLabs.forEach(i => excludedLabs.add(i));
            }
        });

        const failedLabs = labs
            .map((val, i) => ({ val: Number(val), index: i + 1 }))
            .filter(({ val, index }) => val < 3 && !excludedLabs.has(index - 1));

        if (failedLabs.length > 0) {
            setResult(`Студент не допущен к экзамену (не сданы: ${failedLabs.map(l => l.index).join(', ')})`);
            return;
        }

        const actualLabScores = labs.filter((_, i) => !excludedLabs.has(i));
        const labScoreAvg = actualLabScores.length > 0
            ? actualLabScores.reduce((sum, val) => sum + val, 0) / actualLabScores.length
            : 0;
        baseScore += labScoreAvg;

        const testAvg = tests.length > 0
            ? tests.reduce((sum, val) => sum + val, 0) / tests.length
            : 0;
        baseScore += testAvg / 2;

        if (hasNotebook) baseScore += 1;

        baseScore -= Math.floor(skips / 6);

        let researchPoints = 0;

        if (urgentPublication) {
            baseScore = 8;
        }

        reports.forEach(report => {
            switch (report.mode) {
                case 'points':
                    baseScore += 1;
                    break;
                case '2points':
                    baseScore += 2;
                    break;
                case '1point_1lab':
                    baseScore += 1;
                    break;
            }

            if (baseScore >= 10) {
                if (report.mode === 'points') researchPoints += 1;
                if (report.mode === '2points') researchPoints += 2;
                if (report.mode === '1point_1lab') researchPoints += 1;
            }
        });

        if (baseScore > 10) baseScore = 10;

        setResult(baseScore);
    };

    if (!show) return null;

    return (
        <div>
            <h3>Песочница расчёта</h3>
            <select
                value={form}
                onChange={(e) => setForm(e.target.value)}
            >
                <option value="Дневная">Дневная</option>
            </select>

            {form === 'Дневная' && (
                <>
                    <DayFormEvaluation
                        skips={skips}
                        setSkips={setSkips}
                        labCount={labCount}
                        setLabCount={setLabCount}
                        labs={labs}
                        setLabs={setLabs}
                        testCount={testCount}
                        setTestCount={setTestCount}
                        tests={tests}
                        setTests={setTests}
                        hasNotebook={hasNotebook}
                        setHasNotebook={setHasNotebook}
                        onCalculate={handleCalculate}
                    />

                    <div style={{ marginTop: '1rem' }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={showResearchBlock}
                                onChange={(e) => setShowResearchBlock(e.target.checked)}
                            />
                            Учитывать научные работы
                        </label>

                        {showResearchBlock && (
                            <ResearchBlock
                                reports={reports}
                                setReports={setReports}
                                urgentPublication={urgentPublication}
                                setUrgentPublication={setUrgentPublication}
                                labCount={labCount}
                            />
                        )}
                    </div>
                </>
            )}

            {result !== null && (
                <p>Результат: {result}</p>
            )}
            <button onClick={onClose}>Закрыть</button>
        </div>
    );
};

export default SandboxCalculation;