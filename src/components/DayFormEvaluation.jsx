import React from 'react';

const DayFormEvaluation = ({
                               firstDigit,
                               setFirstDigit,
                               secondDigit,
                               setSecondDigit,
                               thirdDigit,
                               setThirdDigit,
                               onCalculate
                           }) => (
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
        <input
            type="number"
            placeholder="Третье число"
            value={thirdDigit}
            onChange={(e) => setThirdDigit(e.target.value)}
        />
        <button onClick={onCalculate}> Рассчитать</button>
    </div>
);

export default DayFormEvaluation;
