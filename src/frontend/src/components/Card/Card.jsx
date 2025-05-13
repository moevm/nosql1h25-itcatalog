import React from 'react';
import './Card.css';

const Card = ({ title, category, description, time, image, onClick }) => {
  const imageUrl = image || "http://localhost:8000/static/images/in_progress.jpg";

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="card" onClick={onClick}>
      <div className="card__image-container">
        <img 
          src={imageUrl} 
          alt={title} 
          className="card__image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "http://localhost:8000/static/images/in_progress.jpg";
          }}
        />
      </div>
      <div className="card__content">
        <div className="card__title">{title}</div>
        {category && <div className="card__category">{category}</div>}
        {description && (
          <div className="card__description">{description}</div>
        )}
	{time && (
          <div className="card__time">
            Изменено: {formatTime(time)}
	  </div>
        )}
      </div>
    </div>
  );
};

export default Card;
