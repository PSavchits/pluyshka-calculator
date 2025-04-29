import React, { useEffect } from 'react';

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

    // Автоматическая коррекция значений
    useEffect(() => {
        if (isRemote) {
            // Для ДО: корректируем только бонусные баллы
            if (bonusPoints > totalBonuses) {
                setBonusPoints(totalBonuses);
            }
        } else {
            // Для дневной формы
            if (closedLabs > totalBonuses) {
                const newClosedLabs = Math.min(closedLabs, totalBonuses);
                setClosedLabs(newClosedLabs);
                setBonusPoints(Math.min(bonusPoints, totalBonuses - newClosedLabs));
            }
        }
    }, [totalBonuses, isRemote]);

    return (
        <div className="bonus-distribution">
            <h3>Распределение бонусов</h3>

            {!isRemote && (
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
                            <span className="hint">(макс. {maxLabsToClose})</span>
                        </label>
                    </div>
                </div>
            )}

            <div className="distribution-controls">
                <div className="control-group">
                    <label>
                        Добавить баллов к оценке:
                        <input
                            type="number"
                            min="0"
                            max={isRemote ? totalBonuses : totalBonuses - closedLabs}
                            value={bonusPoints}
                            onChange={e => {
                                const max = isRemote ? totalBonuses : totalBonuses - closedLabs;
                                const value = Math.max(0, Math.min(
                                    parseInt(e.target.value) || 0,
                                    max
                                ));
                                setBonusPoints(value);
                            }}
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