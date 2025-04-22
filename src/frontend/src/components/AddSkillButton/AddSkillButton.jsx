import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';

const AddSkillButton = ({ groups, onAddSkill }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillData, setSkillData] = useState({
    name: '',
    group: '', 
    image: null
  });

  useEffect(() => {
    if (groups.length > 0 && !skillData.group) {
      setSkillData(prev => ({
        ...prev,
        group: groups[0] 
      }));
    }
  }, [groups]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSkillData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSkillData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddSkill(skillData);
      setIsModalOpen(false);
      setSkillData({
        name: '',
        group: groups.length > 0 ? groups[0] : '',
        image: null
      });
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Ошибка при добавлении навыка');
    }
  };

  return (
    <>
      <button 
        className="add-button" 
        onClick={() => setIsModalOpen(true)}
      >
        <span>+</span> Добавить навык
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="modal-content">
          <h2>Добавить навык</h2>
          <form className="add-profession-form" onSubmit={handleSubmit}>
            <div className="form-scrollable">
              <div className="form-group">
                <label>Название навыка</label>
                <input
                  type="text"
                  name="name"
                  value={skillData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Группа навыков</label>
                <select
                  name="group"
                  value={skillData.group}
                  onChange={handleInputChange}
                  required
                >
                  {groups.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Изображение навыка</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="submit" className="submit-button">
                Добавить навык
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default AddSkillButton;
