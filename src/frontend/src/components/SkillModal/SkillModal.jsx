import React from 'react';
import './SkillModal.css'; 

const SkillModal = ({ skill, onClose, loading }) => {
  if (!skill) return null;

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
                src={skill.image || '/static/images/default.png'}
                alt={skill.skill}
                className="modal-image"
              />
              <h1 className="skill-title">{skill.skill}</h1>
            </div>

            <div className="modal-body">
              <div className="group-section">
                <h2 className="section-title">ГРУППА</h2>
                <p className="skill-group">{skill.skill_group}</p>
              </div>

              {skill.professions?.length > 0 && (
                <div className="professions-section">
                  <h2 className="section-title">ИСПОЛЬЗУЕТСЯ В ПРОФЕССИЯХ</h2>
                  <ul className="professions-list">
                    {skill.professions.map((profession, index) => (
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

export default SkillModal;