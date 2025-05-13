import React, { useState } from 'react';
import './Filters.css';

const GroupFilter = ({
    items = [],
    selectedItems = [],
    onItemChange,
    onSearchChange,
    searchTerm = '', 
    showSearch = true,
    searchPlaceholder = "Поиск...",
    filterLabel = "Фильтры",
    itemLabelProp = "name",
    filteredCount = 0
}) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
  
    const toggleDropdown = (dropdown) => {
      setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };
  
    const handleItemToggle = (item, e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault(); 
      }
      
      if (onItemChange) {
        onItemChange(item);
      }
    };
  
    return (
      <div className="filters-container">
        {/* Фильтр по элементам */}
        <div className="filter-dropdown">
          <button 
            className={`dropdown-toggle ${activeDropdown === 'items' ? 'active' : ''}`}
            onClick={() => toggleDropdown('items')}
          >
            {filterLabel}
            {selectedItems.length > 0 && (
              <span className="filter-count">{selectedItems.length}</span>
            )}
          </button>
  
          {activeDropdown === 'items' && (
            <div className="dropdown-menu">
              {items.map(item => (
                <label key={item[itemLabelProp]} className="dropdown-item" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedItems.some(selected => 
                      selected[itemLabelProp] === item[itemLabelProp]
                    )}
                    onChange={(e) => handleItemToggle(item, e)}
                  />
                  <span>{item[itemLabelProp]}</span>
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
                value={searchTerm}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
            </form>
          </div>
        )}

        {/* Отображение количества найденных объектов */}
        <div className="filtered-count">
          Найдено объектов: {filteredCount}
        </div>
      </div>
    );
};

export default GroupFilter;
