import React from 'react';
import './GroupModal.css';

const GroupModal = ({ group, onClose, loading, groupType }) => {
  if (!group) return null;

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
                src={group.image || '/static/images/default.png'}
                alt={group.name}
                className="modal-image"
              />
              <h1 className="group-title">{group.name}</h1>
              <p className="group-type">{groupType}</p>
            </div>

            <div className="modal-body">
              {group.description && (
                <div className="description-section">
                  <h2 className="section-title">ОПИСАНИЕ</h2>
                  <p className="group-description">{group.description}</p>
                </div>
              )}

              {group.participants?.length > 0 && (
                <div className="participants-section">
                  <h2 className="section-title">УЧАСТНИКИ ГРУППЫ</h2>
                  <ul className="participants-list">
                    {group.participants.map((participant, index) => (
                      <li key={index} className="participant-item">{participant}</li>
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

export default GroupModal;