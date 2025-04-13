import React from 'react';
import './Navigation.css';

const Navigation = ({ showPage, showGroup, activePage, activeGroup }) => {
  return (
    <nav className="sections">
      <div className="sections__main-buttons">
        <button 
          className={`sections__button sections__list ${activePage === 'professions' ? 'active' : ''}`} 
          onClick={() => showPage('professions')}
        >
          Профессии
        </button>
        <button 
          className={`sections__button sections__graph ${activePage === 'graph' ? 'active' : ''}`} 
          onClick={() => showPage('graph')}
        >
          Граф
        </button>
        <button 
          className={`sections__button sections__tools ${activePage === 'tools' ? 'active' : ''}`} 
          onClick={() => showPage('tools')}
        >
          Инструменты
        </button>
        <button 
          className={`sections__button sections__technologies ${activePage === 'technologies' ? 'active' : ''}`} 
          onClick={() => showPage('technologies')}
        >
          Технологии
        </button>
        <button 
          className={`sections__button sections__skills ${activePage === 'skills' ? 'active' : ''}`} 
          onClick={() => showPage('skills')}
        >
          Навыки
        </button>
      </div>
    
      <div className="sections__group-buttons">
        <button 
          className={`sections__group-button group__list ${activeGroup === 'professions' ? 'active' : ''}`} 
          onClick={() => showGroup('professions')}
        >
          Группы профессий
        </button>
        <button 
          className={`sections__group-button group__tools ${activeGroup === 'tools' ? 'active' : ''}`} 
          onClick={() => showGroup('tools')}
        >
          Группы инструментов
        </button>
        <button 
          className={`sections__group-button group__technologies ${activeGroup === 'technologies' ? 'active' : ''}`} 
          onClick={() => showGroup('technologies')}
        >
          Группы технологий
        </button>
        <button 
          className={`sections__group-button group__sckills ${activeGroup === 'skills' ? 'active' : ''}`} 
          onClick={() => showGroup('skills')}
        >
          Группы навыков
        </button>
      </div>
    </nav>
  );
};

export default Navigation;