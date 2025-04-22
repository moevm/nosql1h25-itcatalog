import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { fetchGroups, searchGroups } from '../../services/api';

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

  useEffect(() => {
    const searcherGroups = async () => {
      try {
        setLoading(true);
        let searchedGroups = [];

        if (searchTerm && searchTerm.trim() !== '') {
          searchedGroups = await searchGroups(config.apiEndpoint, searchTerm);
          setGroups(searchedGroups);
        }

      } catch (error) {
        console.error(`Error searching ${config.apiEndpoint}:`, error);
        setError(`Ошибка при поиске в ${config.apiEndpoint}`);
        try {
          const allGroups = await fetchGroups(config.apiEndpoint);
          setGroups(allGroups);
        } catch (err) {
          console.error(`Failed to load ${config.apiEndpoint} after error:`, err);
        }
      } finally {
        setLoading(false);
      }
    };

    searcherGroups();
  }, [searchTerm]);

  const handleAddGroup = async (groupsData)) => {
    try {
      setLoading(true);

      const data = {
        nodes: [
          {
            label: `${config.apiEndpoint}`,
            properties: {
              name: groupsData.skill,
              description: groupsData.description,
              image: groupsData.image?.name || "default.png",
            },
          },
        ]
      };

      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");

      await add(formData);

      const newGroup = {
        group: groupsData.skill,
        description: groupsData.description,
        image: groupsData.image?.name || '/static/images/default.png',
      };

      setGroups(prev => [...prev, newGroup]);
    } catch (error) {
      console.error("Ошибка при добавлении группы:", error);
    } finally {
      setLoading(false);
    }
  };

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
              image={config.defaultImage}
              title={group}
              category={config.title}
            />
          ))}
        </div>
        <AddButton
          groups={groups}
          onAddGroup={handleAddGroup}
        />
      </div>
    </div>
  );
};

export default GroupPage;
