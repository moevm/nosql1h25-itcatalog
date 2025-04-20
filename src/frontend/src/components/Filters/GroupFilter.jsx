import React, { useState } from 'react';
import './Filters.css';

const GroupFilter = ({
    groups = [],
    selectedGroups = [],
    onGroupChange,
    onSearchChange,
    searchTerm = '', 
    showSearch = true,
    searchPlaceholder = "Поиск...",
    groupLabel = "Группы"
  }) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
  
    const toggleDropdown = (dropdown) => {
      setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };
  
    const handleGroupToggle = (groupName, e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault(); 
      }
      
      if (onGroupChange) {
        onGroupChange(groupName);
      }
    };
  
    return (
      <div className="filters-container">
        {/* Фильтр по группам */}
        <div className="filter-dropdown">
          <button 
            className={`dropdown-toggle ${activeDropdown === 'groups' ? 'active' : ''}`}
            onClick={() => toggleDropdown('groups')}
          >
            {groupLabel}
            {selectedGroups.length > 0 && (
              <span className="filter-count">{selectedGroups.length}</span>
            )}
          </button>
  
          {activeDropdown === 'groups' && (
            <div className="dropdown-menu">
              {groups.map(group => (
                <label key={group} className="dropdown-item" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group)}
                    onChange={(e) => handleGroupToggle(group, e)}
                  />
                  <span>{group}</span>
                </label>
              ))}
            </div>
          )}
        </div>
  
        {/* Поле поиска */}
        {showSearch && (
          <div className="search-box">
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm} // связываем с состоянием
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
            </form>
          </div>
        )}
      </div>
    );
  };

export default GroupFilter;
