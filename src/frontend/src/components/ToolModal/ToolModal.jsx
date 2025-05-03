import React, { useState, useEffect } from 'react';
import './ToolModal.css';
import { getIdByName } from '../../services/api';

const ToolModal = ({ tool, onClose, onEdit, allGroups, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    description: '',
    group: ''
  });

  useEffect(() => {
    if (tool) {
      setEditedData({
        name: tool.tool || '',
        description: tool.description || '',
        group: tool.tool_group || ''
      });
    }
  }, [tool]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const toolId = await getIdByName(tool.tool);
      if (!toolId) {
        throw new Error(`Не удалось получить ID для инструмента: ${tool.tool}`);
      }

      const data = {
        nodes: [
          {
            old_name: tool.tool,
            label: "Tool",
            properties: {
              id: toolId,
              name: editedData.name,
              description: editedData.description,
              group: editedData.group
            }
          }
        ],
        relationships: []
      };

      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");

      await onEdit(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert(`Ошибка сохранения: ${error.message}`);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedData({
      name: tool.tool || '',
      description: tool.description || '',
      group: tool.tool_group || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  if (!tool) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="modal-loading">Загрузка...</div>
        ) : (
          <>
            <div className="modal-header">
              <div className="image-container">
                <img
                  src={tool.image || '/static/images/default.png'}
                  alt={editedData.name}
                  className="modal-image"
                />
                {!isEditing && (
                  <button className="edit-button" onClick={handleEditClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedData.name}
                  onChange={handleInputChange}
                  className="edit-title-input"
                />
              ) : (
                <h1 className="tool-title">{editedData.name}</h1>
              )}
              
              <button className="modal-close" onClick={onClose}>
                ×
              </button>
            </div>

            {isEditing && (
              <div className="edit-controls">
                <button className="save-button" onClick={handleSaveClick}>
                  Сохранить
                </button>
                <button className="cancel-button" onClick={handleCancelClick}>
                  Отмена
                </button>
              </div>
            )}

            <div className="modal-body">
              <div className="description-section">
                <h2 className="section-title">ОПИСАНИЕ</h2>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editedData.description}
                    onChange={handleInputChange}
                    className="edit-description-input"
                    rows="4"
                  />
                ) : (
                  <p className="tool-description">
                    {editedData.description || "Описание отсутствует"}
                  </p>
                )}
              </div>

              <div className="group-section">
                <h2 className="section-title">ГРУППА</h2>
                {isEditing ? (
                  <select
                    name="group"
                    value={editedData.group}
                    onChange={handleInputChange}
                    className="edit-group-select"
                  >
                    {allGroups.map((group, index) => (
                      <option key={index} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="tool-group">{editedData.group}</p>
                )}
              </div>

              {tool.professions?.length > 0 && (
                <div className="professions-section">
                  <h2 className="section-title">ИСПОЛЬЗУЕТСЯ В ПРОФЕССИЯХ</h2>
                  <ul className="professions-list">
                    {tool.professions.map((profession, index) => (
                      <li key={index} className="profession-item">{profession}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ToolModal;
