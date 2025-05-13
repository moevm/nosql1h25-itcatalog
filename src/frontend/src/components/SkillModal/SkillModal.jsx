import React, { useState, useEffect, useRef } from 'react';
import './SkillModal.css';
import { getIdByName, fetchProfessions } from '../../services/api';

const SkillModal = ({ skill, onClose, onEdit, allGroups, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    group: '',
    professions: [],
    image: '/static/images/default.png',
    imageFile: null
  });
  const [allProfessions, setAllProfessions] = useState([]);
  const [professionsLoading, setProfessionsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    const loadProfessions = async () => {
      try {
        setProfessionsLoading(true);
        const professions = await fetchProfessions();
        setAllProfessions(professions.map(p => p.profession));
      } catch (error) {
        console.error('Error loading professions:', error);
      } finally {
        setProfessionsLoading(false);
      }
    };
    
    loadProfessions();
  }, []);

  useEffect(() => {
    if (skill) {
      setEditedData({
        name: skill.skill || '',
        group: skill.skill_group || '',
        professions: skill.professions || [],
        image: skill.image || '/static/images/default.png',
        imageFile: null
      });
    }
  }, [skill]);

  useEffect(() => {
    return () => {
      if (editedData.image && editedData.image.startsWith('blob:')) {
        URL.revokeObjectURL(editedData.image);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [editedData.image]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedData(prev => ({
          ...prev,
          image: event.target.result,
          imageFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = async () => {
    try {
      const formData = new FormData();
      
      if (editedData.imageFile) {
        formData.append('image', editedData.imageFile);
      }

      const oldSkillName = skill.skill;
      
      const skillId = await getIdByName(oldSkillName);
      if (!skillId) {
        throw new Error(`Не удалось получить ID для навыка: ${oldSkillName}`);
      }
  
      const getItemId = async (itemName) => {
        if (!itemName) return null;
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
        skill.skill_group ? getItemId(skill.skill_group) : Promise.resolve(null),
        Promise.all(editedData.professions.map(getItemId)),
        Promise.all((skill.professions || []).map(getItemId))
      ]);
  
      const groupRelations = {
        added: [],
        removed: []
      };
      
      if (currentGroupId && currentGroupId !== originalGroupId) {
        groupRelations.added.push({
          type: "GROUPS_SKILL",
          startNode: skillId,
          endNode: currentGroupId
        });
      }
      
      if (originalGroupId && currentGroupId !== originalGroupId) {
        groupRelations.removed.push({
          type: "GROUPS_SKILL",
          startNode: skillId,
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
            type: "REQUIRES",
            startNode: professionId,
            endNode: skillId
          });
        }
      }
  
      for (const professionId of originalProfessionIds) {
        if (professionId && !currentProfessionIds.includes(professionId)) {
          professionRelations.removed.push({
            type: "REQUIRES",
            startNode: professionId,
            endNode: skillId
          });
        }
      }

      const data = {
        nodes: [{
          old_name: oldSkillName, 
          label: "Skill",
          properties: {
            id: skillId,
            name: editedData.name,
            image: editedData.imageFile 
              ? `skill_${editedData.name}_${Date.now()}.jpg` 
              : skill.image
          }
        }],
        relationships: [{
          add_rel: [...groupRelations.added, ...professionRelations.added],
          del_rel: [...groupRelations.removed, ...professionRelations.removed]
        }]
      };
      
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      formData.append("file", blob, "data.json");

      await onEdit(formData);
      setIsEditing(false);

      // Show toast notification
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3000);

      return {
        ...skill,
        skill: editedData.name,
        skill_group: editedData.group,
        professions: editedData.professions,
        image: editedData.imageFile 
          ? URL.createObjectURL(editedData.imageFile)
          : skill.image
      };
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert(`Ошибка сохранения: ${error.message}`);
      setEditedData(prev => ({
        ...prev,
        image: skill.image || '/static/images/default.png'
      }));
      throw error;
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedData({
      name: skill.skill || '',
      group: skill.skill_group || '',
      professions: skill.professions || []
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

  if (!skill) return null;

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
                  src={editedData.image}
                  alt={editedData.skill}
                  className="modal-image"
                />
                {isEditing && (
                  <div className="image-upload">
                    <label htmlFor="image-upload" className="upload-button">
                      Сменить изображение
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
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
                <h1 className="skill-title">{editedData.name}</h1>
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
                  <p className="skill-group">{editedData.group}</p>
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
                      {professionsLoading ? (
                        <div>Загрузка профессий...</div>
                      ) : (
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
                      )}
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

            {/* Toast notification */}
            {showToast && (
              <div className="success-toast">
                Все сохранено успешно!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SkillModal;
