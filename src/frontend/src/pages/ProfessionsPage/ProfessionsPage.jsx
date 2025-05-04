import React, { useState, useEffect } from 'react';
import './ProfessionModal.css';
import { 
  getIdByName
} from '../../services/api';

const ProfessionModal = ({ profession, onClose, onEdit, allSkills, allTechnologies, allTools }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    profession: '',
    skills: [],
    technologies: [],
    tools: [],
    image: '/static/images/default.png'
  });

  const getDisplayName = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.name || item.skill || item.technology || item.tool || '';
  };

  useEffect(() => {
    if (profession) {
      setEditedData({
        profession: getDisplayName(profession.profession),
        skills: profession.skills ? profession.skills.map(s => getDisplayName(s)) : [],
        technologies: profession.technologies ? profession.technologies.map(t => getDisplayName(t)) : [],
        tools: profession.tools ? profession.tools.map(t => getDisplayName(t)) : [],
        image: profession.image || '/static/images/default.png'
      });
      setIsEditing(false);
    }
  }, [profession]);

  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableTechnologies, setAvailableTechnologies] = useState([]);
  const [availableTools, setAvailableTools] = useState([]);

  useEffect(() => {
    const currentSkillNames = editedData.skills.map(getDisplayName);
    setAvailableSkills(
      allSkills.filter(skill => !currentSkillNames.includes(getDisplayName(skill)))
    );
    
    const currentTechNames = editedData.technologies.map(getDisplayName);
    setAvailableTechnologies(
      allTechnologies.filter(tech => !currentTechNames.includes(getDisplayName(tech)))
    );
    
    const currentToolNames = editedData.tools.map(getDisplayName);
    setAvailableTools(
      allTools.filter(tool => !currentToolNames.includes(getDisplayName(tool)))
    );
  }, [allSkills, allTechnologies, allTools, editedData]);

  if (!profession) return null;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const professionId = await getIdByName(profession.profession);
      if (!professionId) {
        throw new Error(`Не удалось получить ID для профессии: ${profession.profession}`);
      }

      const professionNode = {
        old_name: profession.profession,
        label: "Profession",
        properties: {
          id: professionId,
          name: editedData.profession
        }
      };

      if (editedData.image && editedData.image !== profession.image) {
        professionNode.properties.image = editedData.image;
      }

      const getItemId = async (itemName) => {
        const id = await getIdByName(itemName);
        if (!id) console.warn(`Не найден ID для: ${itemName}`);
        return id;
      };

      const [
        currentSkillIds,
        originalSkillIds,
        currentTechIds,
        originalTechIds,
        currentToolIds,
        originalToolIds
      ] = await Promise.all([
        Promise.all((editedData.skills || []).map(getItemId)),
        Promise.all((profession.skills?.map(getDisplayName) || []).map(getItemId)),
        Promise.all((editedData.technologies || []).map(getItemId)),
        Promise.all((profession.technologies?.map(getDisplayName) || []).map(getItemId)),
        Promise.all((editedData.tools || []).map(getItemId)),
        Promise.all((profession.tools?.map(getDisplayName) || []).map(getItemId))
      ]);

      const getRelations = (current, original, type) => {
        const added = current.filter(id => id && !original.includes(id))
          .map(endNode => ({ startNode: professionId, endNode, type }));
        const removed = original.filter(id => id && !current.includes(id))
          .map(endNode => ({ startNode: professionId, endNode, type }));
        return { added, removed };
      };

      const { added: addedSkills, removed: removedSkills } = 
        getRelations(currentSkillIds, originalSkillIds, "REQUIRES");
      const { added: addedTechs, removed: removedTechs } = 
        getRelations(currentTechIds, originalTechIds, "USES_TECH");
      const { added: addedTools, removed: removedTools } = 
        getRelations(currentToolIds, originalToolIds, "USES_TOOL");

      const data = {
        nodes: [professionNode],
        relationships: [{
          add_rel: [...addedSkills, ...addedTechs, ...addedTools],
          del_rel: [...removedSkills, ...removedTechs, ...removedTools]
        }]
      };

      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");

      await onEdit(formData);   

      profession.profession = editedData.profession;
      profession.skills = editedData.skills;
      profession.technologies = editedData.technologies;
      profession.tools = editedData.tools;
      setIsEditing(false);
    
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert(`Ошибка сохранения: ${error.message}`);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedData({
      profession: getDisplayName(profession.profession),
      skills: profession.skills ? profession.skills.map(getDisplayName) : [],
      technologies: profession.technologies ? profession.technologies.map(getDisplayName) : [],
      tools: profession.tools ? profession.tools.map(getDisplayName) : [],
      image: profession.image || '/static/images/default.png'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (field, value) => {
    if (!value) return;
    setEditedData(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }));
  };

  const handleRemoveItem = (field, index) => {
    setEditedData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="image-container">
            <img
              src={editedData.image}
              alt={editedData.profession}
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
              name="profession"
              value={editedData.profession}
              onChange={handleInputChange}
              className="edit-title-input"
            />
          ) : (
            <h1 className="profession-title">{editedData.profession}</h1>
          )}
          
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
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
          <div className="skills-section">
            <h2 className="section-title">НАВЫКИ</h2>
            {isEditing ? (
              <div className="edit-section">
                <div className="current-items">
                  {editedData.skills.map((skill, index) => (
                    <div key={index} className="item-tag">
                      <span>{skill}</span>
                      <button 
                        className="remove-item-button"
                        onClick={() => handleRemoveItem('skills', index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-item-control">
                  <select
                    className="add-select"
                    onChange={(e) => {
                      handleAddItem('skills', e.target.value);
                      e.target.value = '';
                    }}
                    value=""
                  >
                    <option value="">Добавить навык...</option>
                    {availableSkills.map((skill, index) => (
                      <option key={index} value={getDisplayName(skill)}>
                        {getDisplayName(skill)}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
              </div>
            ) : (
              <ul className="skills-list">
                {editedData.skills?.length > 0 ? (
                  editedData.skills.map((skill, index) => (
                    <li key={index} className="skill-item">{skill}</li>
                  ))
                ) : (
                  <li className="no-items">Не указано</li>
                )}
              </ul>
            )}
          </div>

          <div className="technologies-section">
            <h2 className="section-title">ТЕХНОЛОГИИ</h2>
            {isEditing ? (
              <div className="edit-section">
                <div className="current-items">
                  {editedData.technologies.map((tech, index) => (
                    <div key={index} className="item-tag">
                      <span>{tech}</span>
                      <button 
                        className="remove-item-button"
                        onClick={() => handleRemoveItem('technologies', index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-item-control">
                  <select
                    className="add-select"
                    onChange={(e) => {
                      handleAddItem('technologies', e.target.value);
                      e.target.value = '';
                    }}
                    value=""
                  >
                    <option value="">Добавить технологию...</option>
                    {availableTechnologies.map((tech, index) => (
                      <option key={index} value={getDisplayName(tech)}>
                        {getDisplayName(tech)}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
              </div>
            ) : (
              <ul className="technologies-list">
                {editedData.technologies?.length > 0 ? (
                  editedData.technologies.map((tech, index) => (
                    <li key={index} className="technology-item">{tech}</li>
                  ))
                ) : (
                  <li className="no-items">Не указано</li>
                )}
              </ul>
            )}
          </div>

          <div className="tools-section">
            <h2 className="section-title">ИНСТРУМЕНТЫ</h2>
            {isEditing ? (
              <div className="edit-section">
                <div className="current-items">
                  {editedData.tools.map((tool, index) => (
                    <div key={index} className="item-tag">
                      <span>{tool}</span>
                      <button 
                        className="remove-item-button"
                        onClick={() => handleRemoveItem('tools', index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-item-control">
                  <select
                    className="add-select"
                    onChange={(e) => {
                      handleAddItem('tools', e.target.value);
                      e.target.value = '';
                    }}
                    value=""
                  >
                    <option value="">Добавить инструмент...</option>
                    {availableTools.map((tool, index) => (
                      <option key={index} value={getDisplayName(tool)}>
                        {getDisplayName(tool)}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
              </div>
            ) : (
              <ul className="tools-list">
                {editedData.tools?.length > 0 ? (
                  editedData.tools.map((tool, index) => (
                    <li key={index} className="tool-item">{tool}</li>
                  ))
                ) : (
                  <li className="no-items">Не указано</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionModal;
