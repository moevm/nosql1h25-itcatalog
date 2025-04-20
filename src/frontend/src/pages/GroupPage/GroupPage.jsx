import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = groupConfig[groupType] || groupConfig.professions;
        const groupsData = await fetchGroups(config.apiEndpoint);
        setGroups(groupsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [groupType]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  const config = groupConfig[groupType] || groupConfig.professions;

  return (
    <div className="page">
      <div className="container">
        <div className="search-container" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Введите текст для поиска"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <div className="cards">
          {groups.map((group, index) => (
            <Card
              key={index}
              image={group.image || config.defaultImage}
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
