import React, { useState, useEffect } from 'react';
import './ToolModal.css';
import { getIdByName, fetchProfessions, fetchGroups } from '../../services/api';

const ToolModal = ({ tool, onClose, onEdit, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    description: '',
    group: '',
    professions: []
  });
  const [allGroups, setAllGroups] = useState([]);
  const [allProfessions, setAllProfessions] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [groups, professions] = await Promise.all([
          fetchGroups("toolgroups"),
          fetchProfessions()
        ]);

        setAllGroups(groups);
        setAllProfessions(professions);
        
        if (tool) {
          setEditedData({
            name: tool.tool || '',
            description: tool.description || '',
            group: tool.tool_group || '',
            professions: tool.professions || []
          });
        }
        
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
    
    loadData();
  }, [tool]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const toolId = await getIdByName(tool.tool);
      if (!toolId) throw new Error(`Не удалось получить ID инструмента: ${tool.tool}`);

      const getItemId = async (itemName) => {
        const id = await getIdByName(itemName);
        if (!id) console.warn(`Не найден ID для: ${itemName}`);
        return id;
      };

      const [
        currentGroupId,
        originalGroupId,
        currentProfessionIds,
        originalProfessionIds
      ] = await Promise.all([
        editedData.group ? getItemId(editedData.group) : Promise.resolve(null),
        tool.tool_group ? getItemId(tool.tool_group) : Promise.resolve(null),
        Promise.all(editedData.professions.map(getItemId)),
        Promise.all((tool.professions || []).map(getItemId))
      ]);

      const groupRelations = {
        added: [],
        removed: []
      };
      
      if (currentGroupId && currentGroupId !== originalGroupId) {
        groupRelations.added.push({
          type: "GROUPS_TOOL",
          startNode: toolId,
          endNode: currentGroupId
        });
      }
      
      if (originalGroupId && currentGroupId !== originalGroupId) {
        groupRelations.removed.push({
          type: "GROUPS_TOOL",
          startNode: toolId,
          endNode: originalGroupId
        });
      }

      const professionRelations = {
        added: [],
        removed: []
      };

      for (const professionId of currentProfessionIds) {
        if (professionId && !originalProfessionIds.includes(professionId)) {
          professionRelations.added.push({
            type: "USES_TOOL",
            startNode: professionId,
            endNode: toolId
          });
        }
      }

      for (const professionId of originalProfessionIds) {
        if (professionId && !currentProfessionIds.includes(professionId)) {
          professionRelations.removed.push({
            type: "USES_TOOL",
            startNode: professionId,
            endNode: toolId
          });
        }
      }

      const data = {
        nodes: [{
          old_name: tool.tool,
          label: "Tool",
          properties: {
            id: toolId,
            name: editedData.name,
            description: editedData.description
          }
        }],
        relationships: [{
          add_rel: [...groupRelations.added, ...professionRelations.added],
          del_rel: [...groupRelations.removed, ...professionRelations.removed]
        }]
      };

      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");

      await onEdit(formData);
      
      tool.tool = editedData.name;
      tool.description = editedData.description;
      tool.tool_group = editedData.group;
      tool.professions = editedData.professions;
      
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
      group: tool.tool_group || '',
      professions: tool.professions || []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProfession = (profession) => {
    if (!profession) return;
    setEditedData(prev => ({
      ...prev,
      professions: [...prev.professions, profession]
    }));
  };

  const handleRemoveProfession = (index) => {
    setEditedData(prev => ({
      ...prev,
      professions: prev.professions.filter((_, i) => i !== index)
    }));
  };

  const availableProfessions = allProfessions
  .map(p => p.profession) 
  .filter(professionName => 
    professionName && 
    !editedData.professions.includes(professionName)
  );

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
                    <option value="">Выберите группу</option>
                    {allGroups.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="tool-group">{editedData.group}</p>
                )}
              </div>

              <div className="professions-section">
                <h2 className="section-title">ИСПОЛЬЗУЕТСЯ В ПРОФЕССИЯХ</h2>
                {isEditing ? (
                  <div className="edit-professions">
                    <div className="current-professions">
                      {editedData.professions.map((professionName, index) => (
                        <div key={index} className="profession-tag">
                          <span>{professionName}</span>
                          <button 
                            onClick={() => handleRemoveProfession(index)}
                            className="remove-profession-button"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="add-profession-control">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddProfession(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        value=""
                      >
                        <option value="">Добавить профессию...</option>
                        {availableProfessions.map((professionName, index) => (
                          <option key={index} value={professionName}>
                            {professionName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <ul className="professions-list">
                  {editedData.professions.length > 0 ? (
                    editedData.professions.map((professionName, index) => (
                      <li key={index} className="profession-item">{professionName}</li>
                    ))
                  ) : (
                    <li className="no-items">Не указано</li>
                  )}
                </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ToolModal;
