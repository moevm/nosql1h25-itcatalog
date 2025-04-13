import React from 'react';
import './Filters.css';

const Filters = ({ 
  categories, 
  tools, 
  technologies, 
  showSearch, 
  searchPlaceholder,
  categoryLabel = 'Категории',
  toolLabel = 'Инструменты',
  technologyLabel = 'Технологии',
  onSearchChange,
  onCategoryChange,
  onToolChange,
  onTechnologyChange
}) => {
  return (
    <div className="filters">
      {categories && (
        <select 
          className="filters__categories"
          onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
        >
          <option>{categoryLabel}</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
      )}
      
      {tools && (
        <select 
          className="filters__tools"
          onChange={(e) => onToolChange && onToolChange(e.target.value)}
        >
          <option>{toolLabel}</option>
          {tools.map((tool, index) => (
            <option key={index} value={tool}>{tool}</option>
          ))}
        </select>
      )}
      
      {technologies && (
        <select 
          className="filters__technologies"
          onChange={(e) => onTechnologyChange && onTechnologyChange(e.target.value)}
        >
          <option>{technologyLabel}</option>
          {technologies.map((tech, index) => (
            <option key={index} value={tech}>{tech}</option>
          ))}
        </select>
      )}
      
      {showSearch && (
        <input 
          type="text" 
          placeholder={searchPlaceholder || "Введите текст для поиска"} 
          className="filters__search"
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default Filters;