import React from 'react';

const PresentationBlock = ({
                               presentations,
                               setPresentations,
                               voicedPresentations,
                               setVoicedPresentations
                           }) => (
    <div className="presentation-block section">
        <h3>Презентации</h3>

        <div className="input-group">
            <label>
                Создано презентаций:
                <input
                    type="number"
                    min="0"
                    value={presentations}
                    onChange={e => setPresentations(Math.max(0, parseInt(e.target.value) || 0))}
                />
            </label>
        </div>

        <div className="input-group">
            <label>
                Презентаций с озвучкой:
                <input
                    type="number"
                    min="0"
                    max={presentations}
                    value={voicedPresentations}
                    onChange={e => setVoicedPresentations(Math.max(0, Math.min(presentations, parseInt(e.target.value) || 0)))}
                />
            </label>
        </div>
    </div>
);

export default PresentationBlock;