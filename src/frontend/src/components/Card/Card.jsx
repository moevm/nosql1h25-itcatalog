import React from 'react';
import './Card.css';

const Card = ({ title, category, description, image, onClick }) => {
  const imageUrl = image || "http://localhost:8000/static/images/in_progress.jpg";

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
      </div>
    </div>
  );
};

export default Card;
