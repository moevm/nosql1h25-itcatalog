import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import './AddButton.css';

const AddButton = ({ 
  categories = [], 
  skills = [], 
  technologies = [], 
  tools = [],
  onAddProfession 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    profession: '',
    image: null,
    category: '', 
    skills: [], 
    technologies: [], 
    tools: []    
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleCheckboxChange = (type, value) => {
    setFormData(prev => {
      const currentItems = prev[type];
      const updatedItems = currentItems.includes(value)
        ? currentItems.filter(item => item !== value) 
        : [...currentItems, value]; 
      return { ...prev, [type]: updatedItems };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProfession(formData);
    setIsModalOpen(false);
    setFormData({
      profession: '',
      image: null,
      category: '',
      skills: [],
      technologies: [],
      tools: []
    });
  };

  return (
    <>
      <button 
        className="add-button"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="plus-icon">+</span> Добавить профессию
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="add-profession-form">
          <h2>Добавить новую профессию</h2>
          
          <div className="form-group">
            <label>Название профессии:</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Изображение:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="form-group">
            <label>Категория:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Навыки:</label>
            <div className="checkbox-group">
              {skills.map((skillObj, index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skillObj.skill)}
                    onChange={() => handleCheckboxChange('skills', skillObj.skill)}
                  />
                  <span className="checkbox-custom"></span>
                  {skillObj.skill}
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Технологии:</label>
            <div className="checkbox-group">
              {technologies.map((techObj, index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.technologies.includes(techObj.technology)}
                    onChange={() => handleCheckboxChange('technologies', techObj.technology)}
                  />
                  <span className="checkbox-custom"></span>
                  {techObj.technology}
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Инструменты:</label>
            <div className="checkbox-group">
              {tools.map((toolObj, index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.tools.includes(toolObj.tool)}
                    onChange={() => handleCheckboxChange('tools', toolObj.tool)}
                  />
                  <span className="checkbox-custom"></span>
                  {toolObj.tool}
                </label>
              ))}
            </div>
          </div>
          
          <button type="submit" className="submit-button">Добавить</button>
        </form>
      </Modal>
    </>
  );
};

export default AddButton;
