import React, { useState } from 'react';
import './Filters.css';

const Filters = ({
  categories = [],
  tools = [],
  technologies = [],
  selectedFilters = {
    categories: [],
    tools: [],
    technologies: []
  },
  onFilterChange,
  onSearchChange,
  showSearch = true,
  searchPlaceholder = "Поиск профессий..."
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleFilterToggle = (type, id) => {
    if (onFilterChange) {
      onFilterChange(type, id);
    }
  };

  // Группировка инструментов по группам
  const groupedTools = tools.reduce((acc, tool) => {
    const group = tool.tool_group || 'Другие';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(tool);
    return acc;
  }, {});

  // Группировка технологий по группам
  const groupedTechnologies = technologies.reduce((acc, tech) => {
    const group = tech.technology_group || 'Другие';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(tech);
    return acc;
  }, {});

  return (
    <div className="filters-container">
      {/* Фильтр по категориям */}
      <div className="filter-dropdown">
        <button 
          className={`dropdown-toggle ${activeDropdown === 'categories' ? 'active' : ''}`}
          onClick={() => toggleDropdown('categories')}
        >
          Категории
          {selectedFilters.categories.length > 0 && (
            <span className="filter-count">{selectedFilters.categories.length}</span>
          )}
        </button>
        {activeDropdown === 'categories' && (
          <div className="dropdown-menu">
            {categories.map(category => (
              <label key={category.id || category} className="dropdown-item">
                <input
                  type="checkbox"
                  checked={selectedFilters.categories.includes(category.id || category)}
                  onChange={() => handleFilterToggle('categories', category.id || category)}
                />
                <span>{category.name || category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Фильтр по инструментам */}
      <div className="filter-dropdown">
        <button 
          className={`dropdown-toggle ${activeDropdown === 'tools' ? 'active' : ''}`}
          onClick={() => toggleDropdown('tools')}
        >
          Инструменты
          {selectedFilters.tools.length > 0 && (
            <span className="filter-count">{selectedFilters.tools.length}</span>
          )}
        </button>
        {activeDropdown === 'tools' && (
          <div className="dropdown-menu">
            {Object.entries(groupedTools).map(([groupName, groupTools]) => (
              <div key={groupName} className="tool-group">
                <div className="group-header">
                  <input
                    type="checkbox"
                    checked={groupTools.every(tool => 
                      selectedFilters.tools.includes(tool.id || tool.tool)
                    )}
                    onChange={() => {
                      const allSelected = groupTools.every(tool =>
                        selectedFilters.tools.includes(tool.id || tool.tool)
                      );
                      groupTools.forEach(tool => {
                        if (allSelected) {
                          handleFilterToggle('tools', tool.id || tool.tool);
                        } else if (!selectedFilters.tools.includes(tool.id || tool.tool)) {
                          handleFilterToggle('tools', tool.id || tool.tool);
                        }
                      });
                    }}
                  />
                  <span>{groupName}</span>
                </div>
                <div className="group-items">
                  {groupTools.map(tool => (
                    <label key={tool.id || tool.tool} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={selectedFilters.tools.includes(tool.id || tool.tool)}
                        onChange={() => handleFilterToggle('tools', tool.id || tool.tool)}
                      />
                      <span>{tool.tool}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Фильтр по технологиям */}
      <div className="filter-dropdown">
        <button 
          className={`dropdown-toggle ${activeDropdown === 'technologies' ? 'active' : ''}`}
          onClick={() => toggleDropdown('technologies')}
        >
          Технологии
          {selectedFilters.technologies.length > 0 && (
            <span className="filter-count">{selectedFilters.technologies.length}</span>
          )}
        </button>
        {activeDropdown === 'technologies' && (
          <div className="dropdown-menu">
            {Object.entries(groupedTechnologies).map(([groupName, groupTechs]) => (
              <div key={groupName} className="tech-group">
                <div className="group-header">
                  <input
                    type="checkbox"
                    checked={groupTechs.every(tech => 
                      selectedFilters.technologies.includes(tech.id || tech.technology)
                    )}
                    onChange={() => {
                      const allSelected = groupTechs.every(tech =>
                        selectedFilters.technologies.includes(tech.id || tech.technology)
                      );
                      groupTechs.forEach(tech => {
                        if (allSelected) {
                          handleFilterToggle('technologies', tech.id || tech.technology);
                        } else if (!selectedFilters.technologies.includes(tech.id || tech.technology)) {
                          handleFilterToggle('technologies', tech.id || tech.technology);
                        }
                      });
                    }}
                  />
                  <span>{groupName}</span>
                </div>
                <div className="group-items">
                  {groupTechs.map(tech => (
                    <label key={tech.id || tech.technology} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={selectedFilters.technologies.includes(tech.id || tech.technology)}
                        onChange={() => handleFilterToggle('technologies', tech.id || tech.technology)}
                      />
                      <span>{tech.technology}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Поле поиска */}
      {showSearch && (
        <div className="search-box">
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default Filters;
