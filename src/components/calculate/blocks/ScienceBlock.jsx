import React from 'react';

const ScienceBlock = ({
                          writtenWorks,
                          setWrittenWorks,
                          publishedWorks,
                          setPublishedWorks,
                          oralReports,
                          setOralReports,
                          urgentPublications,
                          setUrgentPublications,
                          awards,
                          setAwards
                      }) => {
    const handleWrittenWorksChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setWrittenWorks('');
            return;
        }
        const value = Math.max(0, parseInt(rawValue) || 0);
        setWrittenWorks(value);
    };

    const handlePublishedWorksChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setPublishedWorks('');
            return;
        }
        const value = Math.max(0, Math.min(
            parseInt(rawValue) || 0,
            writtenWorks
        ));
        setPublishedWorks(value);
    };

    const handleOralReportsChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setOralReports('');
            return;
        }
        const value = Math.max(0, Math.min(
            parseInt(rawValue) || 0,
            writtenWorks
        ));
        setOralReports(value);
    };

    const handleUrgentPublicationsChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setUrgentPublications('');
            return;
        }
        const value = Math.max(0, Math.min(
            parseInt(rawValue) || 0,
            writtenWorks
        ));
        setUrgentPublications(value);
    };

    const handleAwardsChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setAwards('');
            return;
        }
        const value = Math.max(0, Math.min(
            parseInt(rawValue) || 0,
            writtenWorks
        ));
        setAwards(value);
    };

    return (
        <div className="science-block section">
            <h3>Научная деятельность</h3>

            <div className="input-group">
                <label>
                    Написано работ:
                    <input
                        type="number"
                        min="0"
                        value={writtenWorks}
                        onChange={handleWrittenWorksChange}
                        onBlur={() => {
                            if (writtenWorks === '') setWrittenWorks(0);
                        }}
                        placeholder="0-∞"
                        className="no-spin"
                    />
                </label>
            </div>

            <div className="input-group">
                <label>
                    Опубликовано работ:
                    <input
                        type="number"
                        min="0"
                        value={publishedWorks}
                        onChange={handlePublishedWorksChange}
                        onBlur={() => {
                            if (publishedWorks === '') setPublishedWorks(0);
                        }}
                        placeholder={`0-${writtenWorks}`}
                        className="no-spin"
                    />
                </label>
            </div>

            <div className="input-group">
                <label>
                    Работ с устным докладом:
                    <input
                        type="number"
                        min="0"
                        value={oralReports}
                        onChange={handleOralReportsChange}
                        onBlur={() => {
                            if (oralReports === '') setOralReports(0);
                        }}
                        placeholder={`0-${writtenWorks}`}
                        className="no-spin"
                    />
                </label>
            </div>

            <div className="input-group">
                <label>
                    Срочных публикаций:
                    <input
                        type="number"
                        min="0"
                        value={urgentPublications}
                        onChange={handleUrgentPublicationsChange}
                        onBlur={() => {
                            if (urgentPublications === '') setUrgentPublications(0);
                        }}
                        placeholder={`0-${writtenWorks}`}
                        className="no-spin"
                    />
                </label>
            </div>

            <div className="input-group">
                <label>
                    Наград за работы:
                    <input
                        type="number"
                        min="0"
                        value={awards}
                        onChange={handleAwardsChange}
                        onBlur={() => {
                            if (awards === '') setAwards(0);
                        }}
                        placeholder={`0-${writtenWorks}`}
                        className="no-spin"
                    />
                </label>
            </div>
        </div>
    );
};

export default ScienceBlock;