import React from 'react';
import './Card.css';

const Card = ({ title, category }) => {
  return (
    <div className="card">
      <div className="card__placeholder">
        {title}
      </div>
      <div className="card__title">{title}</div>
      <div className="card__category">{category}</div>
    </div>
  );
};

export default Card;