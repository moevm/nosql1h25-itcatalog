import React from 'react';
import './Card.css';

const Card = ({ title, category, image }) => {
  const imageUrl = image || '/default-image.png';
  
  return (
    <div className="card">
      <div className="card__image-wrapper">
        <img src={imageUrl} alt={title} className="card__image" />
      </div>
      <div className="card__title">{title}</div>
      <div className="card__category">{category}</div>
    </div>
  );
};

export default Card;
