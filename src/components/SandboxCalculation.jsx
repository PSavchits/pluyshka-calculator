import React from 'react';
import DayFormEvaluation from "./DayFormEvaluation";
import RemoteFormEvaluation from "./RemoteFormEvaluation";
import {getSandboxParams, saveSandboxParams} from "../utils/db";

const SandboxCalculation = ({show, onClose}) => {
    const [firstDigit, setFirstDigit] = React.useState('');
    const [secondDigit, setSecondDigit] = React.useState('');
    const [thirdDigit, setThirdDigit] = React.useState('');
    const [form, setForm] = React.useState('Дневная');
    const [result, setResult] = React.useState(null);

    React.useEffect(() => {
        const loadParams = async () => {
            const params = await getSandboxParams();
            setFirstDigit(params.firstDigit || '');
            setSecondDigit(params.secondDigit || '');
            setThirdDigit(params.thirdDigit || '');
            setForm(params.form || 'Дневная');
            setResult(params.result || null);
        };
        loadParams();
    }, []);

    const handleCalculate = async () => {
        let res = 0;
        if (form === 'Дневная') {
            res = Number(firstDigit) + Number(secondDigit) + Number(thirdDigit || 0);
        } else {
            res = Number(firstDigit) + Number(secondDigit) - 1;
        }
        setResult(res);
        await saveSandboxParams({
            firstDigit,
            secondDigit,
            thirdDigit,
            form,
            result: res
        });
    };

    if (!show) return null;

    return (
        <div>
            <div>
                <h3>Песочница расчёта</h3>
                <select
                    value={form}
                    onChange={(e) => setForm(e.target.value)}
                >
                    <option value="Дневная">Дневная</option>
                    <option value="ДО">ДО</option>
                </select>
                {form === 'Дневная' ? (
                    <DayFormEvaluation
                        firstDigit={firstDigit}
                        setFirstDigit={setFirstDigit}
                        secondDigit={secondDigit}
                        setSecondDigit={setSecondDigit}
                        thirdDigit={thirdDigit}
                        setThirdDigit={setThirdDigit}
                        onCalculate={handleCalculate}
                    />
                ) : (
                    <RemoteFormEvaluation
                        firstDigit={firstDigit}
                        setFirstDigit={setFirstDigit}
                        secondDigit={secondDigit}
                        setSecondDigit={setSecondDigit}
                        onCalculate={handleCalculate}
                    />
                )}
                {result !== null && (
                    <p>Результат: {result}</p>
                )}
                <button onClick={onClose}> Закрыть</button>
            </div>
        </div>
    );
};

export default SandboxCalculation;