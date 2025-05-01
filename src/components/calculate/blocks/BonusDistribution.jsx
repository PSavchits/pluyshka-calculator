import React, { useEffect } from 'react';
import '../../../styles/global.css';

const BonusDistribution = ({
                               totalBonuses,
                               closedLabs = 0,
                               setClosedLabs = () => {},
                               bonusPoints,
                               setBonusPoints,
                               maxLabsToClose = 4,
                               isRemote = false
                           }) => {
    const usedBonuses = isRemote ? bonusPoints : closedLabs + bonusPoints;
    const remainingBonuses = totalBonuses - usedBonuses;

    const handleClosedLabsChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setClosedLabs('');
            return;
        }

        const value = Math.max(0, Math.min(
            parseInt(rawValue) || 0,
            totalBonuses,
            maxLabsToClose
        ));
        setClosedLabs(value);
    };

    const handleBonusPointsChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setBonusPoints('');
            return;
        }

        const max = isRemote ? totalBonuses : totalBonuses - closedLabs;
        const value = Math.max(0, Math.min(
            parseInt(rawValue) || 0,
            max
        ));
        setBonusPoints(value);
    };

    useEffect(() => {
        if (isRemote) {
            if (bonusPoints > totalBonuses) {
                setBonusPoints(totalBonuses);
            }
        } else {
            if (closedLabs > totalBonuses) {
                const newClosedLabs = Math.min(closedLabs, totalBonuses);
                setClosedLabs(newClosedLabs);
                setBonusPoints(Math.min(bonusPoints, totalBonuses - newClosedLabs));
            }
        }
    }, [totalBonuses, isRemote, bonusPoints, closedLabs, setBonusPoints, setClosedLabs]);

    return (
        <div className="bonus-distribution">
            <h3>Распределение бонусов</h3>

            {!isRemote && (
                <div className="distribution-controls">
                    <div className="input-group">
                        <label>
                            Закрыть лабораторных работ:
                            <input
                                type="number"
                                min="0"
                                value={closedLabs}
                                onChange={handleClosedLabsChange}
                                onBlur={() => {
                                    if (closedLabs === '') setClosedLabs(0);
                                }}
                                placeholder={`0-${maxLabsToClose}`}
                                className="no-spin"
                            />
                            <span className="hint">(макс. {maxLabsToClose})</span>
                        </label>
                    </div>
                </div>
            )}

            <div className="distribution-controls">
                <div className="input-group">
                    <label>
                        Добавить баллов к оценке:
                        <input
                            type="number"
                            min="0"
                            value={bonusPoints}
                            onChange={handleBonusPointsChange}
                            onBlur={() => {
                                if (bonusPoints === '') setBonusPoints(0);
                            }}
                            placeholder={`0-${isRemote ? totalBonuses : totalBonuses - closedLabs}`}
                            className="no-spin"
                        />
                        <span className="hint">
              (доступно: {isRemote ? totalBonuses : totalBonuses - closedLabs})
            </span>
                    </label>
                </div>
            </div>

            {isRemote && (
                <div className="remote-notice">
                    <p>Для дистанционной формы закрытие лабораторных работ недоступно</p>
                </div>
            )}

            <div className="bonus-status">
                <p>Использовано бонусов: {usedBonuses}</p>
                <p className={remainingBonuses < 0 ? 'error' : ''}>
                    Остаток бонусов: {remainingBonuses}
                </p>
                {remainingBonuses < 0 && (
                    <p className="error-message">Превышено количество доступных бонусов!</p>
                )}
            </div>
        </div>
    );
};

export default BonusDistribution;