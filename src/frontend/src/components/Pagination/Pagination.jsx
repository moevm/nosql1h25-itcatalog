import React from 'react';
import './Pagination.css';

const Pagination = () => {
  return (
    <footer className="pagination">
      <button className="pagination__prev-button">« Назад</button>
      <span>1 2 3 ... 7 8</span>
      <button className="pagination__next-button">Далее »</button>
    </footer>
  );
};

export default Pagination;