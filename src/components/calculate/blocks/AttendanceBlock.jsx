import React from 'react';

const AttendanceBlock = ({ skippedHours, setSkippedHours, notesVolume, setNotesVolume }) => {
    const handleSkippedHoursChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setSkippedHours('');
            return;
        }

        const value = Math.max(0, parseInt(rawValue) || 0);
        setSkippedHours(value % 2 === 0 ? value : value - 1);
    };

    const handleNotesVolumeChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setNotesVolume('');
            return;
        }

        const value = Math.min(100, Math.max(0, parseInt(rawValue) || 0));
        setNotesVolume(value);
    };

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
                        onChange={handleSkippedHoursChange}
                        onBlur={() => {
                            if (skippedHours === '') setSkippedHours(0);
                        }}
                        placeholder="0-∞ (чётные)"
                        className="no-spin"
                    />
                </label>
            </div>

            <div className="input-group">
                <label>
                    Объём конспекта (%):
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={notesVolume}
                        onChange={handleNotesVolumeChange}
                        onBlur={() => {
                            if (notesVolume === '') setNotesVolume(0);
                        }}
                        placeholder="0-100"
                        className="no-spin"
                    />
                </label>
            </div>
        </div>
    );
};

export default AttendanceBlock;