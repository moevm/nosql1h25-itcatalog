import React from 'react';
import './ImportExportButtons.css';

const ImportExportButtons = () => {
  return (
    <div className="import-export-buttons">
      <button className="import-export-buttons__button import-export-buttons__import">Импорт</button>
      <button className="import-export-buttons__button import-export-buttons__export">Экспорт</button>
    </div>
  );
};

export default ImportExportButtons;