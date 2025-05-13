import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal/Modal';
import './AddGroupButton.css';

const AddGroupButton = ({ onAddGroup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupData, setGroupData] = useState({
    name: '',
    image: null,
    description: ''
  });
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setGroupData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddGroup(groupData);
      setIsModalOpen(false);
      setGroupData({
        name: '',
        image: null,
        description: ''
      });

      setShowToast(true);
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding group:', error);
      alert(`Ошибка при добавлении группы: ${error.message}`);
    }
  };

  return (
    <>
      <button 
        className="add-button" 
        onClick={() => setIsModalOpen(true)}
      >
        <span className="plus-icon">+</span> Добавить группу
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="modal-content">
          <h2>Добавить группу</h2>
          <form className="add-group-form" onSubmit={handleSubmit}>
            <div className="form-scrollable">
              <div className="form-group">
                <label>Название группы</label>
                <input
                  type="text"
                  name="name"
                  value={groupData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Изображение группы</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <label>Описание группы</label>
                <textarea
                  name="description"
                  value={groupData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="description-textarea"
                  placeholder="Введите описание группы..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="submit" className="submit-button">
                Добавить группу
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {showToast && (
        <div className="success-toast">
          Группа успешно добавлена!
        </div>
      )}
    </>
  );
};

export default AddGroupButton;
