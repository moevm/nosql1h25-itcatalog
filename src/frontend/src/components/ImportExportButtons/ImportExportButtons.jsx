import React, { useState } from 'react';
import './ImportExportButtons.css';

const ImportExportButtons = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [fileName, setFileName] = useState('export.json');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();

      // Create a link element to download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'export.json'); // Use the entered file name
      document.body.appendChild(link);
      link.click();
      link.remove();

      setIsExportModalOpen(false); // Close the modal after export
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Ошибка при экспорте данных.');
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
      setIsImportModalOpen(false); // Close the modal after import
    } catch (error) {
      console.error('Error importing data:', error);
      alert(`Ошибка при импорте данных: ${error.message}`);
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
        onClick={() => setIsExportModalOpen(true)}
      >
        Экспорт
      </button>

      {isExportModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setIsExportModalOpen(false)}>
              &times;
            </button>
            <h2>Экспорт</h2>
            <p>Введите название файла:</p>
            <input
              type="text"
              className="filename-input"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="export.json"
            />
            <button className="sections__button" onClick={handleExport}>
              Экспортировать
            </button>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setIsImportModalOpen(false)}>
              &times;
            </button>
            <h2>Импорт</h2>
            <p>Выберите файл для импорта:</p>
            <label className="sections__button">
              Выбрать файл
              <input
                type="file"
                className="file-input"
                onChange={handleFileChange}
              />
            </label>
            {uploadedFileName && <p>Загружен файл: {uploadedFileName}</p>}
            {uploadedFileName && (
              <button className="sections__button" onClick={handleImport}>
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
