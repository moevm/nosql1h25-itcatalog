import React, { useState, useEffect } from 'react';
import './ImportExportButtons.css';
import { exportCatalog, importCatalog } from '../../services/api';

const ImportExportButtons = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [fileName, setFileName] = useState('export');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

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
  
    try {
      setImportLoading(true);
      console.log('Starting import process with file:', selectedFile.name);
      
      const response = await importCatalog(selectedFile);
      console.log('Import response:', response);
      const importedNodes = response?.count || 0;
      const importedRelationships = response?.relationships || 0;
      const importedImages = response?.images || 0;
      
      setIsImportModalOpen(false);
      
      const successMessage = `Импорт данных успешно выполнен.\n` +
        `Импортировано объектов: ${importedNodes}\n` +
        `Импортировано связей: ${importedRelationships}\n` +
        `Импортировано изображений: ${importedImages}`;
      
      alert(successMessage);
      console.log('Import completed successfully with counts:', {
        nodes: importedNodes,
        relationships: importedRelationships,
        images: importedImages
      });

      window.location.reload();
      
    } catch (error) {
      console.error('Error importing data:', error);
      alert(`Ошибка при импорте данных: ${error.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('ie-modal-overlay')) {
      setIsExportModalOpen(false);
      setIsImportModalOpen(false);
    }
  };

  return (
    <div className="ie-buttons-container">
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
            <h2>
              Импорт
              <div className="ie-info-icon-container">
                <span className="ie-info-icon">i</span>
                <div className="ie-info-tooltip">
                  <p>1. Предоставьте json файл и изображения в .zip формате</p>
                  <p>2. Допустимы разрешения изображений: jpg, jpeg, png, webp, gif, svg</p>
                  <p>3. Изображение должно быть названо по id node, к которой оно собирается прикрепиться</p>
                </div>
              </div>
            </h2>
            <p>Выберите файл для импорта:</p>
            <label className="ie-file-upload-button">
              Выбрать файл
              <input
                type="file"
                accept=".zip"
                className="ie-file-input"
                onChange={handleFileChange}
              />
            </label>
            {uploadedFileName && <p>Загружен файл: {uploadedFileName}</p>}
            {uploadedFileName && (
              <button 
                className={`ie-import-button ${importLoading ? 'ie-button-loading' : ''}`}
                onClick={handleImport}
                disabled={importLoading}
              >
                {importLoading ? 'Импортируется...' : 'Импортировать'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExportButtons;
