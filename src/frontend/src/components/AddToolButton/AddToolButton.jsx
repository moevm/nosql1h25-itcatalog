import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../components/Modal/Modal';

const AddToolButton = ({ groups, onAddTool }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toolData, setToolData] = useState({
    name: '',
    group: '', 
    image: null,
    description: ''
  });
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    if (groups.length > 0 && typeof groups[0] === 'string') {
      if (!toolData.group) {
        setToolData(prev => ({
          ...prev,
          group: groups[0]
        }));
      }
    } 
    else if (groups.length > 0 && !toolData.group) {
      setToolData(prev => ({
        ...prev,
        group: groups[0].name 
      }));
    }

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [groups]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setToolData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setToolData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddTool(toolData);
      setIsModalOpen(false);
      setToolData({
        name: '',
        group: groups.length > 0 
          ? (typeof groups[0] === 'string' ? groups[0] : groups[0].name)
          : '',
        image: null,
        description: ''
      });

      setShowToast(true);
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding tool:', error);
      alert(`Ошибка при добавлении инструмента: ${error.message}`);
    }
  };

  return (
    <>
      <button 
        className="add-button" 
        onClick={() => setIsModalOpen(true)}
      >
        <span className="plus-icon">+</span> Добавить инструмент
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="modal-content">
          <h2>Добавить инструмент</h2>
          <form className="add-profession-form" onSubmit={handleSubmit}>
            <div className="form-scrollable">
              <div className="form-group">
                <label>Название инструмента</label>
                <input
                  type="text"
                  name="name"
                  value={toolData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Группа инструмента</label>
                <select
                  name="group"
                  value={toolData.group}
                  onChange={handleInputChange}
                  required
                >
                  {groups.map((group, index) => {
                    const groupName = typeof group === 'string' ? group : group.name;
                    return (
                      <option key={index} value={groupName}>
                        {groupName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Изображение инструмента</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <label>Описание инструмента</label>
                <textarea
                    name="description"
                    value={toolData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="description-textarea"
                    placeholder="Введите описание инструмента..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="submit" className="submit-button">
                Добавить инструмент
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {showToast && (
        <div className="success-toast">
          Инструмент успешно добавлен!
        </div>
      )}
    </>
  );
};

export default AddToolButton;
