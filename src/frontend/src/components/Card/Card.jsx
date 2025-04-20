import React from 'react';
import './Card.css';

const Card = ({ title, category, image }) => {
  const imageUrl = image || '/default-image.png';
  
  return (
    <div className="card">
      <div className="card__image-container">
        <img 
          src={imageUrl} 
          alt={title} 
          className="card__image"
          onError={(e) => {
            e.target.src = '/default-image.png';
          }}
        />
      </div>
      <div className="card__content">
        <h3 className="card__title">{title}</h3>
        <span className="card__category">{category}</span>
      </div>
    </div>
  );
};

export default Card;
