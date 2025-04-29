import React, { useEffect } from 'react';

const BonusDistribution = ({
                               totalBonuses,
                               closedLabs,
                               setClosedLabs,
                               bonusPoints,
                               setBonusPoints,
                               maxLabsToClose
                           }) => {
    const usedBonuses = closedLabs + bonusPoints;
    const remainingBonuses = totalBonuses - usedBonuses;

    // Автоматическая коррекция при изменении общего числа бонусов
    useEffect(() => {
        if (closedLabs > totalBonuses) {
            const newClosedLabs = Math.min(closedLabs, totalBonuses);
            setClosedLabs(newClosedLabs);
            setBonusPoints(Math.min(bonusPoints, totalBonuses - newClosedLabs));
        }
    }, [totalBonuses]);

    return (
        <div className="bonus-distribution">
            <h3>Распределение бонусов</h3>

            <div className="distribution-controls">
                <div className="control-group">
                    <label>
                        Закрыть лабораторных работ:
                        <input
                            type="number"
                            min="0"
                            max={Math.min(maxLabsToClose, totalBonuses)}
                            value={closedLabs}
                            onChange={e => {
                                const value = Math.max(0, Math.min(
                                    parseInt(e.target.value) || 0,
                                    totalBonuses,
                                    maxLabsToClose
                                ));
                                setClosedLabs(value);
                            }}
                        />
                    </label>
                </div>

                <div className="control-group">
                    <label>
                        Добавить баллов к оценке:
                        <input
                            type="number"
                            min="0"
                            max={totalBonuses - closedLabs}
                            value={bonusPoints}
                            onChange={e => {
                                const value = Math.max(0, Math.min(
                                    parseInt(e.target.value) || 0,
                                    totalBonuses - closedLabs
                                ));
                                setBonusPoints(value);
                            }}
                        />
                    </label>
                </div>
            </div>

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