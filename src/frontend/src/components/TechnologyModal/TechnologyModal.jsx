import React, { useState, useEffect } from 'react';
import './TechnologyModal.css';
import { getIdByName, fetchProfessions, fetchGroups } from '../../services/api';

const TechnologyModal = ({ technology, onClose, onEdit, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    description: '',
    group: '',
    professions: []
  });
  const [allGroups, setAllGroups] = useState([]);
  const [allProfessions, setAllProfessions] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        const [groups, professions] = await Promise.all([
          fetchGroups('technologygroups'), 
          fetchProfessions()
        ]);
        
        setAllGroups(groups);
        setAllProfessions(professions.map(p => p.profession));
        
        if (technology) {
          setEditedData({
            name: technology.technology || '',
            description: technology.description || '',
            group: technology.technology_group || '',
            professions: technology.professions || []
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    loadData();
  }, [technology]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const technologyId = await getIdByName(technology.technology);
      if (!technologyId) {
        throw new Error(`Не удалось получить ID для технологии: ${technology.technology}`);
      }

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
        technology.technology_group ? getItemId(technology.technology_group) : Promise.resolve(null),
        Promise.all(editedData.professions.map(getItemId)),
        Promise.all((technology.professions || []).map(getItemId))
      ]);

      const groupRelations = {
        added: [],
        removed: []
      };
      
      if (currentGroupId && currentGroupId !== originalGroupId) {
        groupRelations.added.push({
          type: "GROUPS_TECH",
          startNode: technologyId,
          endNode: currentGroupId
        });
      }
      
      if (originalGroupId && currentGroupId !== originalGroupId) {
        groupRelations.removed.push({
          type: "GROUPS_TECH",
          startNode: technologyId,
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
            type: "USES_TECH",
            startNode: professionId,
            endNode: technologyId
          });
        }
      }

      for (const professionId of originalProfessionIds) {
        if (professionId && !currentProfessionIds.includes(professionId)) {
          professionRelations.removed.push({
            type: "USES_TECH",
            startNode: professionId,
            endNode: technologyId
          });
        }
      }

      const data = {
        nodes: [{
          old_name: technology.technology,
          label: "Technology",
          properties: {
            id: technologyId,
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
      
      const updatedTechnology = {
        ...technology,
        technology: editedData.name,
        description: editedData.description,
        technology_group: editedData.group,
        professions: editedData.professions
      };
      
      setIsEditing(false);
      return updatedTechnology;
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert(`Ошибка сохранения: ${error.message}`);
      throw error;
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedData({
      name: technology.technology || '',
      description: technology.description || '',
      group: technology.technology_group || '',
      professions: technology.professions || []
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

  const availableProfessions = allProfessions.filter(
    p => !editedData.professions.includes(p)
  );

  if (!technology) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {loading || dataLoading ? (
          <div className="modal-loading">Загрузка...</div>
        ) : (
          <>
            <div className="modal-header">
              <div className="image-container">
                <img
                  src={technology.image || '/static/images/default.png'}
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
                <h1 className="technology-title">{editedData.name}</h1>
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
                  <p className="technology-description">
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
                      <option key={group.name} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="technology-group">{editedData.group}</p>
                )}
              </div>

              <div className="professions-section">
                <h2 className="section-title">ИСПОЛЬЗУЕТСЯ В ПРОФЕССИЯХ</h2>
                {isEditing ? (
                  <div className="edit-professions">
                    <div className="current-professions">
                      {editedData.professions.map((profession, index) => (
                        <div key={index} className="profession-tag">
                          <span>{profession}</span>
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
                        {availableProfessions.map((profession, index) => (
                          <option key={index} value={profession}>
                            {profession}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <ul className="professions-list">
                    {editedData.professions.length > 0 ? (
                      editedData.professions.map((profession, index) => (
                        <li key={index} className="profession-item">{profession}</li>
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

export default TechnologyModal;
