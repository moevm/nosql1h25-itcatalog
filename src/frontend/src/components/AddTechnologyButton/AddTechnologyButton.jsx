import React, { useState } from 'react';
import Modal from '../Modal/Modal';

const AddTechnologyButton = ({ groups, onAddTechnology}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [technologyData, setTechnologyData] = useState({
    name: '',
    group: groups.length > 0 ? groups[0] : '', 
    image: null,
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTechnologyData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setTechnologyData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddTechnology(technologyData);
      setIsModalOpen(false);
      setTechnologyData({
        name: '',
        group: groups.length > 0 ? groups[0] : '',
        image: null,
        description: ''
      });
    } catch (error) {
      console.error('Error adding technology:', error);
      alert('Ошибка при добавлении технологии');
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
                <label>Группа технологии</label>
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
                <label>Изображение технологии</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <label>Описание технологии</label>
                <textarea
                    name="description"
                    value={technologyData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="description-textarea"
                    placeholder="Введите описание технологии..."
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
    </>
  );
};

export default AddTechnologyButton;