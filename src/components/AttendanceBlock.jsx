import React from 'react';

const AttendanceBlock = ({
                             skippedHours,
                             setSkippedHours,
                             notesVolume,
                             setNotesVolume
                         }) => {
    return (
        <div className="attendance-section section">
            <h3>Посещаемость</h3>

            <div className="input-group">
                <label>
                    Пропущено часов (кратно 2):
                    <input
                        type="number"
                        min="0"
                        step="2"
                        value={skippedHours}
                        onChange={e => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setSkippedHours(value % 2 === 0 ? value : value - 1);
                        }}
                        className="attendance-input"
                    />
                </label>
            </div>

            <div className="input-group">
                <label>
                    Объем конспекта (%):
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={notesVolume}
                        onChange={e => {
                            const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                            setNotesVolume(value);
                        }}
                        className="notes-input"
                    />
                </label>
            </div>
        </div>
    );
};

export default AttendanceBlock;