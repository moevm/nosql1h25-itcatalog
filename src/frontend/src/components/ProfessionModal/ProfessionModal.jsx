import React from 'react';
import './ProfessionModal.css';

const ProfessionModal = ({ profession, onClose }) => {
  if (!profession) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <img
            src={profession.image || '/static/images/default.png'}
            alt={profession.profession}
            className="modal-image"
          />
          <h1 className="profession-title">{profession.profession}</h1>
        </div>

        <div className="modal-body">
          <div className="skills-section">
            <h2 className="section-title">НАВЫКИ</h2>
            <ul className="skills-list">
              {profession.skills?.length > 0 ? (
                profession.skills.map((skill, index) => (
                  <li key={index} className="skill-item">{skill}</li>
                ))
              ) : (
                <li className="no-items">Не указано</li>
              )}
            </ul>
          </div>

          <div className="technologies-section">
            <h2 className="section-title">ТЕХНОЛОГИИ</h2>
            <div className="subsection">
              <h3 className="subsection-title">1. Языки программирования:</h3>
              <ul className="tech-list">
                {profession.technologies?.length > 0 ? (
                  profession.technologies.map((tech, index) => (
                    <li key={index} className="tech-item">{tech}</li>
                  ))
                ) : (
                  <li className="no-items">Не указано</li>
                )}
              </ul>
            </div>
          </div>

          <div className="tools-section">
            <h2 className="section-title">ИНСТРУМЕНТЫ</h2>
            <ul className="tools-list">
              {profession.tools?.length > 0 ? (
                profession.tools.map((tool, index) => (
                  <li key={index} className="tool-item">{tool}</li>
                ))
              ) : (
                <li className="no-items">Не указано</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionModal;