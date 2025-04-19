import React, { useState } from 'react';
import { updateStudentEvaluation } from '../utils/db';
import RemoteFormEvaluation from './RemoteFormEvaluation';

const RemoteForm = ({ student }) => {
    const [result, setResult] = useState(student.result ?? null);
    const [firstDigit, setFirstDigit] = useState(0);
    const [secondDigit, setSecondDigit] = useState(0);

    const handleCalculate = () => {
        const calculated = Number(firstDigit) + Number(secondDigit) - 1;
        setResult(calculated);
    };

    const handleSave = async () => {
        const updated = await updateStudentEvaluation(
            student.id,
            result,
            0,
            '[]',
            '[]',
            'ДО'
        );
        alert(`Сохранено: ${updated.fullName} — Оценка: ${result}`);
    };

    return (
        <div>
            <h4>Оценка для: {student.fullName}</h4>
            <RemoteFormEvaluation
                firstDigit={firstDigit}
                setFirstDigit={setFirstDigit}
                secondDigit={secondDigit}
                setSecondDigit={setSecondDigit}
                onCalculate={handleCalculate}
            />

            {result !== null && (
                <div>
                    <p>Результат: {result}</p>
                    <button onClick={handleSave}>Сохранить</button>
                </div>
            )}
        </div>
    );
};

export default RemoteForm;