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
                      }) => (
    <div className="science-block section">
        <h3>Научная деятельность</h3>

        <div className="input-group">
            <label>
                Написано работ:
                <input
                    type="number"
                    min="0"
                    value={writtenWorks}
                    onChange={e => setWrittenWorks(Math.max(0, parseInt(e.target.value) || 0))}
                />
            </label>
        </div>

        <div className="input-group">
            <label>
                Опубликовано работ:
                <input
                    type="number"
                    min="0"
                    max={writtenWorks}
                    value={publishedWorks}
                    onChange={e => setPublishedWorks(Math.max(0, Math.min(writtenWorks, parseInt(e.target.value) || 0)))}
                />
            </label>
        </div>

        <div className="input-group">
            <label>
                Работ с устным докладом:
                <input
                    type="number"
                    min="0"
                    max={writtenWorks}
                    value={oralReports}
                    onChange={e => setOralReports(Math.max(0, Math.min(writtenWorks, parseInt(e.target.value) || 0)))}
                />
            </label>
        </div>

        <div className="input-group">
            <label>
                Срочных публикаций:
                <input
                    type="number"
                    min="0"
                    max={writtenWorks}
                    value={urgentPublications}
                    onChange={e => setUrgentPublications(Math.max(0, Math.min(writtenWorks, parseInt(e.target.value) || 0)))}
                />
            </label>
        </div>

        <div className="input-group">
            <label>
                Наград за работы:
                <input
                    type="number"
                    min="0"
                    max={writtenWorks}
                    value={awards}
                    onChange={e => setAwards(Math.max(0, Math.min(writtenWorks, parseInt(e.target.value) || 0)))}
                />
            </label>
        </div>
    </div>
);

export default ScienceBlock;