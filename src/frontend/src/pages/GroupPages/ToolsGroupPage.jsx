import React, { useState } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';

const groupsData = [
  { title: 'Инструменты разработки', category: 'Группа инструментов' },
  { title: 'Инструменты тестирования', category: 'Группа инструментов' },
  { title: 'Инструменты управления', category: 'Группа инструментов' },
];

const ToolsGroupPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');

  const categories = ['Все категории', 'Инструменты разработки', 'Инструменты тестирования', 'Инструменты управления'];

  const filteredGroups = groupsData.filter(group => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Все категории' || group.title === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page">
      <div className="container">
        <Filters
          categories={categories}
          showSearch={true}
          searchPlaceholder="Введите текст для поиска"
          categoryLabel="Категории"
          onSearchChange={(value) => setSearchTerm(value)}
          onCategoryChange={(value) => setSelectedCategory(value)}
        />
        <div className="cards">
          {filteredGroups.map((group, index) => (
            <Card
              key={index}
              image={group.image}
              title={group.title}
              category={group.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsGroupPage;