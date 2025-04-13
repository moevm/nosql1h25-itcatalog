import React, { useState } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';

const groupsData = [
  { title: 'Технические', category: 'Группа навыков' },
  { title: 'Мягкие', category: 'Группа навыков' },
  { title: 'Управленческие', category: 'Группа навыков' },
];

const SkillsGroupPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');

  const categories = ['Все категории', 'Технические', 'Мягкие', 'Управленческие'];

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

export default SkillsGroupPage;