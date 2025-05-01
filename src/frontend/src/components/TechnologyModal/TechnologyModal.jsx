import React from 'react';
import './TechnologyModal.css';

const TechnologyModal = ({ technology, onClose, loading }) => {
  if (!technology) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="modal-loading">Загрузка...</div>
        ) : (
          <>
            <div className="modal-header">
              <img
                src={technology.image || '/static/images/default.png'}
                alt={technology.technology}
                className="modal-image"
              />
              <h1 className="technology-title">{technology.technology}</h1>
            </div>

            <div className="modal-body">
              <div className="group-section">
                <h2 className="section-title">ГРУППА</h2>
                <p className="technology-group">{technology.technology_group}</p>
              </div>

              {technology.description && (
                <div className="description-section">
                  <h2 className="section-title">ОПИСАНИЕ</h2>
                  <p className="technology-description">{technology.description}</p>
                </div>
              )}

              {technology.professions?.length > 0 && (
                <div className="professions-section">
                  <h2 className="section-title">ИСПОЛЬЗУЕТСЯ В ПРОФЕССИЯХ</h2>
                  <ul className="professions-list">
                    {technology.professions.map((profession, index) => (
                      <li key={index} className="profession-item">{profession}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TechnologyModal;