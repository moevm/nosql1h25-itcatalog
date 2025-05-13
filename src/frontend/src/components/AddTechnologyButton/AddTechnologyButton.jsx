import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal/Modal';
import './AddTechnologyButton.css';

const AddTechnologyButton = ({ groups, onAddTechnology }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [technologyData, setTechnologyData] = useState({
    name: '',
    group: '',
    image: null,
    description: ''
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
    if (groups.length > 0 && !technologyData.group) {
      setTechnologyData(prev => ({
        ...prev,
        group: groups[0]
      }));
    }
  }, [groups]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTechnologyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setTechnologyData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!technologyData.group) {
      alert('Пожалуйста, выберите группу технологий');
      return;
    }

    try {
      await onAddTechnology({
        ...technologyData,
        group: technologyData.group
      });
      
      setIsModalOpen(false);
      setTechnologyData({
        name: '',
        group: groups.length > 0 ? groups[0] : '',
        image: null,
        description: ''
      });

      // Show success toast
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error adding technology:', error);
      alert('Ошибка при добавлении технологии: ' + error.message);
    }
  };

  return (
    <>
      <button 
        className="add-button" 
        onClick={() => setIsModalOpen(true)}
      >
        <span>+</span> Добавить технологию
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="modal-content">
          <h2>Добавить технологию</h2>
          <form className="add-profession-form" onSubmit={handleSubmit}>
            <div className="form-scrollable">
              <div className="form-group">
                <label>Название технологии</label>
                <input
                  type="text"
                  name="name"
                  value={technologyData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Группа технологий</label>
                <select
                  name="group"
                  value={technologyData.group}
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
                <label>Описание</label>
                <textarea
                  name="description"
                  value={technologyData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Изображение технологии</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="submit" className="submit-button">
                Добавить технологию
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Toast notification */}
      {showToast && (
        <div className="success-toast">
          Технология успешно добавлена!
        </div>
      )}
    </>
  );
};

export default AddTechnologyButton;
