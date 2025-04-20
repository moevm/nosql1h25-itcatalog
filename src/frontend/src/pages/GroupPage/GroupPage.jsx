import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';
import { fetchGroups } from '../../services/api';

const GroupPage = ({ groupType }) => {
  const groupConfig = {
    professions: {
      title: 'Категории профессий',
      apiEndpoint: 'categories',
      defaultImage: '/images/profession-group.png'
    },
    skills: {
      title: 'Группы навыков',
      apiEndpoint: 'skillgroups',
      defaultImage: '/images/skill-group.png'
    },
    technologies: {
      title: 'Группы технологий',
      apiEndpoint: 'technologygroups',
      defaultImage: '/images/tech-group.png'
    },
    tools: {
      title: 'Группы инструментов',
      apiEndpoint: 'toolgroups',
      defaultImage: '/images/tool-group.png'
    }
  };

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = groupConfig[groupType] || groupConfig.professions;
        const groupsData = await fetchGroups(config.apiEndpoint);
        setGroups(['Все категории', ...groupsData]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [groupType]);

  const filteredGroups = groups.filter(group => {
    if (group === 'Все категории') return true;
    const matchesSearch = typeof group === 'string' && 
      group.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Все категории' || group === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  const config = groupConfig[groupType] || groupConfig.professions;

  return (
    <div className="page">
      <div className="container">
        <Filters
          categories={groups}
          showSearch={true}
          searchPlaceholder="Введите текст для поиска"
          categoryLabel={config.title}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
        />
        <div className="cards">
          {filteredGroups
            .filter(group => group !== 'Все категории')
            .map((group, index) => (
              <Card
                key={index}
                image={config.defaultImage}
                title={group}
                category={config.title}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
