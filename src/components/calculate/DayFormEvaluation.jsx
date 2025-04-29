import React, { useState, useEffect } from 'react';

const DayFormEvaluation = ({
                               skips,
                               setSkips,
                               labs,
                               setLabs,
                               labCount,
                               setLabCount,
                               tests,
                               setTests,
                               testCount,
                               setTestCount,
                               hasNotebook,
                               setHasNotebook,
                               onCalculate
                           }) => {
    useEffect(() => {
        setLabs(Array.from({ length: labCount }, (_, i) => labs[i] || 0));
    }, [labCount]);

    useEffect(() => {
        setTests(Array.from({ length: testCount }, (_, i) => tests[i] || 0));
    }, [testCount]);

    return (
        <div>
            <h3>Основные параметры:</h3>
            <div>
                <label>Пропуски (часов): </label>
                <input
                    type="number"
                    value={skips}
                    onChange={(e) => setSkips(Number(e.target.value))}
                />
            </div>

            <div>
                <label>Количество лабораторных: </label>
                <input
                    type="number"
                    min="0"
                    value={labCount}
                    onChange={(e) => setLabCount(Number(e.target.value))}
                />
                {labs.map((lab, i) => (
                    <input
                        key={i}
                        type="number"
                        placeholder={`Лабораторная ${i + 1}`}
                        value={lab}
                        onChange={(e) => {
                            const updated = [...labs];
                            updated[i] = Number(e.target.value);
                            setLabs(updated);
                        }}
                    />
                ))}
            </div>

            <div>
                <label>Количество тестов: </label>
                <input
                    type="number"
                    min="0"
                    value={testCount}
                    onChange={(e) => setTestCount(Number(e.target.value))}
                />
                {tests.map((test, i) => (
                    <input
                        key={i}
                        type="number"
                        placeholder={`Тест ${i + 1}`}
                        value={test}
                        onChange={(e) => {
                            const updated = [...tests];
                            updated[i] = Number(e.target.value);
                            setTests(updated);
                        }}
                    />
                ))}
            </div>

            <div>
                <label>Конспект:</label>
                <input
                    type="checkbox"
                    checked={hasNotebook}
                    onChange={(e) => setHasNotebook(e.target.checked)}
                />
                <span>Есть</span>
            </div>

            <button onClick={onCalculate}>Рассчитать</button>
        </div>
    );
};

export default DayFormEvaluation;
