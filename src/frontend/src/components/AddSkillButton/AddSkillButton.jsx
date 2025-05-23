import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal/Modal';
import './AddSkillButton.css';

const AddSkillButton = ({ groups, onAddSkill }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillData, setSkillData] = useState({
    name: '',
    group: '', 
    image: null
  });
  // Add state for toast notification
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

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
    setSkillData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleFileChange = (e) => {
    setSkillData(prev => ({ 
      ...prev, 
      image: e.target.files[0] 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillData.group) {
      alert('Пожалуйста, выберите группу навыков');
      return;
    }

    try {
      await onAddSkill({
        ...skillData,
        group: skillData.group 
      });
      
      setIsModalOpen(false);
      setSkillData({
        name: '',
        group: groups.length > 0 ? groups[0] : '', 
        image: null
      });

      // Show success toast
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Ошибка при добавлении навыка: ' + error.message);
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

      {/* Toast notification */}
      {showToast && (
        <div className="success-toast">
          Навык успешно добавлен!
        </div>
      )}
    </>
  );
};

export default AddSkillButton;
