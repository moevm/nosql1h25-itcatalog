import React, { useState, useEffect } from 'react';
import './ImportExportButtons.css';
import { exportCatalog } from '../../services/api';

const ImportExportButtons = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [fileName, setFileName] = useState('export');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    console.log('Export modal state changed:', isExportModalOpen);
  }, [isExportModalOpen]);

  const handleExportClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Export button clicked');
    setIsExportModalOpen(true);
  };

  const handleCloseExportModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsExportModalOpen(false);
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      console.log('Starting export process with filename:', fileName);
      
      await exportCatalog(fileName);
      
      setIsExportModalOpen(false);
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Ошибка при экспорте данных.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadedFileName(file ? file.name : '');
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Выберите файл для импорта.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to import data: ${errorText}`);
      }

      alert('Импорт данных успешно выполнен.');
      setIsImportModalOpen(false);
    } catch (error) {
      console.error('Error importing data:', error);
      alert(`Ошибка при импорте данных: ${error.message}`);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('ie-modal-overlay')) {
      setIsExportModalOpen(false);
      setIsImportModalOpen(false);
    }
  };

  return (
    <div className="import-export-buttons">
      <button
        className="import-export-buttons__button import-export-buttons__import"
        onClick={() => setIsImportModalOpen(true)}
      >
        Импорт
      </button>
      <button
        className="import-export-buttons__button import-export-buttons__export"
        onClick={handleExportClick}
      >
        Экспорт
      </button>

      {isExportModalOpen && (
        <div className="ie-modal-overlay" onClick={handleOverlayClick}>
          <div className="ie-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ie-close-button" onClick={handleCloseExportModal}>
              &times;
            </button>
            <h2>Экспорт</h2>
            <p>Введите название файла:</p>
            <div className="ie-filename-container">
              <input
                type="text"
                className="ie-filename-input"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="export"
              />
              <span className="ie-filename-extension">.zip</span>
            </div>
            <button 
              className={`ie-export-button ${exportLoading ? 'ie-button-loading' : ''}`} 
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? 'Экспортируется...' : 'Экспортировать'}
            </button>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="ie-modal-overlay" onClick={handleOverlayClick}>
          <div className="ie-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ie-close-button" onClick={() => setIsImportModalOpen(false)}>
              &times;
            </button>
            <h2>Импорт</h2>
            <p>Выберите файл для импорта:</p>
            <label className="ie-file-upload-button">
              Выбрать файл
              <input
                type="file"
                className="ie-file-input"
                onChange={handleFileChange}
              />
            </label>
            {uploadedFileName && <p>Загружен файл: {uploadedFileName}</p>}
            {uploadedFileName && (
              <button className="ie-import-button" onClick={handleImport}>
                Импортировать
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExportButtons;
