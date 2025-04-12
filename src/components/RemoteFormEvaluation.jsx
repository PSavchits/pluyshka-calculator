import React from 'react';

const RemoteFormEvaluation = ({firstDigit, setFirstDigit, secondDigit, setSecondDigit, onCalculate}) => (
    <div>
        <input
            type="number"
            placeholder="Первое число"
            value={firstDigit}
            onChange={(e) => setFirstDigit(e.target.value)}
        />
        <input
            type="number"
            placeholder="Второе число"
            value={secondDigit}
            onChange={(e) => setSecondDigit(e.target.value)}
        />
        <button onClick={onCalculate}> Рассчитать</button>
    </div>
);

export default RemoteFormEvaluation;
