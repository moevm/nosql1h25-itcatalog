import React from 'react';
import './ToolModal.css'; 

const ToolModal = ({ tool, onClose, loading }) => {
  if (!tool) return null;

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
                src={tool.image || '/static/images/default.png'}
                alt={tool.tool}
                className="modal-image"
              />
              <h1 className="tool-title">{tool.tool}</h1>
            </div>

            <div className="modal-body">
              <div className="description-section">
                <h2 className="section-title">ОПИСАНИЕ</h2>
                <p className="tool-description">
                  {tool.description || "Описание отсутствует"}
                </p>
              </div>

              <div className="group-section">
                <h2 className="section-title">ГРУППА</h2>
                <p className="tool-group">{tool.tool_group}</p>
              </div>

              {tool.professions?.length > 0 && (
                <div className="professions-section">
                  <h2 className="section-title">ИСПОЛЬЗУЕТСЯ В ПРОФЕССИЯХ</h2>
                  <ul className="professions-list">
                    {tool.professions.map((profession, index) => (
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

export default ToolModal;