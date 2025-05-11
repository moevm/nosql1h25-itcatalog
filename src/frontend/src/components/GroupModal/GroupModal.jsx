import React, { useState, useEffect } from 'react';
import './GroupModal.css';
import { getIdByName, fetchProfessions, fetchSkills, fetchTechnologies, fetchTools } from '../../services/api';

const GroupModal = ({ group, onClose, onEdit, loading, groupType, label, participantType }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    description: '',
    participants: [],
    image: null, 
    imageFile: null 
  });
  const [allParticipants, setAllParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const extractName = (participant) => {
    if (typeof participant === 'string') return participant;
    return participant.name || participant.profession || participant.skill || participant.technology || participant.tool || '';
  };

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setParticipantsLoading(true);
        let participantsData = [];
        
        switch(participantType) {
          case 'professions':
            participantsData = await fetchProfessions();
            break;
          case 'skills':
            participantsData = await fetchSkills();
            break;
          case 'technologies':
            participantsData = await fetchTechnologies();
            break;
          case 'tools':
            participantsData = await fetchTools();
            break;
          default:
            console.warn(`Unknown participant type: ${participantType}`);
        }
        
        const participants = participantsData.map(extractName).filter(name => name);
        setAllParticipants(participants);
      } catch (error) {
        console.error('Error loading participants:', error);
      } finally {
        setParticipantsLoading(false);
      }
    };
    
    loadParticipants();
  }, [participantType]);

  useEffect(() => {
    if (group) {
      const normalizedParticipants = group.participants 
        ? group.participants.map(extractName).filter(name => name)
        : [];
      
      setEditedData({
        name: group.name || '',
        description: group.description || '',
        participants: normalizedParticipants,
        image: group.image || '/static/images/default.png',
        imageFile: null
      });
    }
  }, [group]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const formData = new FormData();

      if (editedData.imageFile) {
        formData.append('image', editedData.imageFile);
      }

      const groupId = await getIdByName(group.name);
      if (!groupId) {
        throw new Error(`Не удалось получить ID для группы: ${group.name}`);
      }
  
      const getItemId = async (itemName) => {
        try {
          const id = await getIdByName(itemName);
          if (!id) {
            console.warn(`Не найден ID для: ${itemName}`);
            return null;
          }
          return id;
        } catch (error) {
          console.error(`Ошибка при получении ID для ${itemName}:`, error);
          return null;
        }
      };
  
      const [currentParticipantIds, originalParticipantIds] = await Promise.all([
        Promise.all(editedData.participants.map(getItemId)),
        Promise.all((group.participants || []).map(getItemId))
      ]);
  
      const validCurrentIds = currentParticipantIds.filter(id => id !== null);
      const validOriginalIds = originalParticipantIds.filter(id => id !== null);
  
      const relationType = {
        professions: "BELONGS_TO",
        skills: "GROUPS_SKILL",
        technologies: "GROUPS_TECH",
        tools: "GROUPS_TOOL"
      }[participantType] || "BELONGS_TO";
  
      const relations = [{
        add_rel: validCurrentIds
          .filter(id => !validOriginalIds.includes(id))
          .map(participantId => ({
            type: relationType,
            startNode: participantId,
            endNode: groupId
          })),
        del_rel: validOriginalIds
          .filter(id => !validCurrentIds.includes(id))
          .map(participantId => ({
            type: relationType,
            startNode: participantId,
            endNode: groupId
          }))
      }];
  
      const data = {
        nodes: [{
          old_name: group.name,
          label: label,
          properties: {
            id: groupId,
            name: editedData.name,
            description: editedData.description,
            image: editedData.imageFile 
              ? `group_${editedData.name}_${Date.now()}.jpg` 
              : group.image
          }
        }],
        relationships: relations
      };
  
      console.log('Отправляемые данные:', data); 
  
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      
      formData.append("file", blob, "data.json");
  

      console.log(JSON.stringify(data));
      await onEdit({
        formData,
        oldName: group.name,
        newName: editedData.name
      });
    
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      setEditedData(prev => ({
        ...prev,
        image: group.image || '/static/images/default.png'
      }));
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedData({
      name: group.name || '',
      description: group.description || '',
      participants: group.participants || []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddParticipant = (participant) => {
    if (!participant) return;
    setEditedData(prev => ({
      ...prev,
      participants: [...prev.participants, participant]
    }));
  };

  const handleRemoveParticipant = (index) => {
    setEditedData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
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

  useEffect(() => {
    return () => {
      if (editedData.image && editedData.image.startsWith('blob:')) {
        URL.revokeObjectURL(editedData.image);
      }
    };
  }, [editedData.image]);

  const availableParticipants = allParticipants.filter(
    p => !editedData.participants.includes(p)
  );

  if (!group) return null;

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
                  alt={editedData.name}
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
                <h1 className="group-title">{editedData.name}</h1>
              )}
              
              <button className="modal-close" onClick={onClose}>
                ×
              </button>
              <p className="group-type">{groupType}</p>
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
                  <p className="group-description">
                    {editedData.description || "Описание отсутствует"}
                  </p>
                )}
              </div>

              <div className="participants-section">
                <h2 className="section-title">УЧАСТНИКИ ГРУППЫ</h2>
                {isEditing ? (
                  <div className="edit-participants">
                    <div className="current-participants">
                    {editedData.participants.map((participant, index) => (
                      <div key={index} className="participant-tag">
                        <span>{participant}</span>
                        <button 
                          onClick={() => handleRemoveParticipant(index)}
                          className="remove-participant-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    </div>
                    <div className="add-participant-control">
                      {participantsLoading ? (
                        <div>Загрузка участников...</div>
                      ) : (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddParticipant(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          value=""
                        >
                          <option value="">Добавить участника...</option>
                          {availableParticipants.map((participant, index) => (
                            <option key={index} value={participant}>
                              {participant}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ) : (
                  <ul className="participants-list">
                    {editedData.participants.length > 0 ? (
                      editedData.participants.map((participant, index) => (
                        <li key={index} className="participant-item">{participant}</li>
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

export default GroupModal;
