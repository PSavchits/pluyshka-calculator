import React from 'react';

const PresentationBlock = ({
                               presentations,
                               setPresentations,
                               voicedPresentations,
                               setVoicedPresentations
                           }) => {
    const handlePresentationsChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setPresentations('');
            return;
        }

        const value = Math.max(0, parseInt(rawValue) || 0);
        setPresentations(value);
    };

    const handleVoicedChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setVoicedPresentations('');
            return;
        }

        const value = Math.max(0, Math.min(
            parseInt(rawValue) || 0,
            presentations
        ));
        setVoicedPresentations(value);
    };

    return (
        <div className="presentation-block section">
            <h3>Презентации</h3>

            <div className="input-group">
                <label>
                    Создано презентаций:
                    <input
                        type="number"
                        min="0"
                        value={presentations}
                        onChange={handlePresentationsChange}
                        onBlur={() => {
                            if (presentations === '') setPresentations(0);
                        }}
                        placeholder="0-∞"
                        className="no-spin"
                    />
                </label>
            </div>

            <div className="input-group">
                <label>
                    Презентаций с озвучкой:
                    <input
                        type="number"
                        min="0"
                        value={voicedPresentations}
                        onChange={handleVoicedChange}
                        onBlur={() => {
                            if (voicedPresentations === '') setVoicedPresentations(0);
                        }}
                        placeholder={`0-${presentations}`}
                        className="no-spin"
                    />
                </label>
            </div>
        </div>
    );
};

export default PresentationBlock;