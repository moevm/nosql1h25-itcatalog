import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import AddGroupButton from '../../components/AddGroupButton/AddGroupButton';
import { v4 as uuidv4 } from 'uuid';
import { fetchGroups, searchGroups, searchGroupsDescription, add } from '../../services/api';

const GroupPage = ({ groupType }) => {
  const groupConfig = {
    professions: {
      title: 'Категории профессий',
      apiEndpoint: 'categories',
      defaultImage: '/images/default-category.png'
    },
    skills: {
      title: 'Группы навыков',
      apiEndpoint: 'skillgroups',
      defaultImage: '/images/default-skill.png'
    },
    technologies: {
      title: 'Группы технологий',
      apiEndpoint: 'technologygroups',
      defaultImage: '/images/default-technology.png'
    },
    tools: {
      title: 'Группы инструментов',
      apiEndpoint: 'toolgroups',
      defaultImage: '/images/default-tool.png'
    }
  };

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDescriptionTerm, setSearchDescriptionTerm] = useState('');
  const [searchMode, setSearchMode] = useState('name'); 
  const config = groupConfig[groupType] || groupConfig.professions;

  const normalizeGroup = (group) => {
    if (typeof group === 'string') {
      return {
        name: group,
        description: '',
        image: config.defaultImage
      };
    }

    const name = group.name || group.group || 'Без названия';

    return {
      name,
      description: group.description || '',
      image: group.image || config.defaultImage
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const groupsData = await fetchGroups(config.apiEndpoint);
        console.log('API Response:', groupsData);

        const normalizedGroups = groupsData.map(normalizeGroup);
        setGroups(normalizedGroups);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupType, config.apiEndpoint, config.defaultImage]);

  useEffect(() => {
    const searchGroupsHandler = async () => {
      try {
        setLoading(true);

        if (searchTerm.trim() !== '' && searchMode === 'name') {
          const searchedGroups = await searchGroups(config.apiEndpoint, searchTerm);
          console.log('Search by name response:', searchedGroups);
          const normalizedGroups = searchedGroups.map(normalizeGroup);
          setGroups(normalizedGroups);
        } 
        else if (searchDescriptionTerm.trim() !== '' && searchMode === 'description') {
          const searchedGroups = await searchGroupsDescription(config.apiEndpoint, searchDescriptionTerm);
          console.log('Search by description response:', searchedGroups);
          const normalizedGroups = searchedGroups.map(normalizeGroup);
          setGroups(normalizedGroups);
        }
        else {
          const allGroups = await fetchGroups(config.apiEndpoint);
          const normalizedGroups = allGroups.map(normalizeGroup);
          setGroups(normalizedGroups);
        }
      } catch (error) {
        console.error(`Error searching ${config.apiEndpoint}:`, error);
        setError(`Ошибка при поиске ${config.title}`);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchGroupsHandler();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [
    searchTerm, 
    searchDescriptionTerm,
    searchMode,
    config.apiEndpoint, 
    config.title, 
    config.defaultImage
  ]);

  const handleAddGroup = async (groupData) => {
    try {
      setLoading(true);

      const groupName = groupData.name;
      const description = groupData.description;
      const imageFile = groupData.image;

      const groupId = uuidv4();
      const imageName = imageFile ? `${uuidv4()}-${imageFile.name}` : 'default.png';

      const nodes = [
        {
          label: "Group",
          properties: {
            id: groupId,
            name: groupName,
            image: imageName,
            description: description || "",
          },
        },
      ];

      const data = { nodes };
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await add(formData);

      setGroups(prev => [...prev, {
        name: groupName,
        description: description || '',
        image: `http://localhost:8000/uploads/${imageName}`
      }]);

    } catch (error) {
      console.error("Ошибка при добавлении группы:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="page">
      <div className="container">
        <div className="search-container" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button 
              onClick={() => setSearchMode('name')}
              style={{
                padding: '8px 16px',
                backgroundColor: searchMode === 'name' ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Поиск по названию
            </button>
            <button 
              onClick={() => setSearchMode('description')}
              style={{
                padding: '8px 16px',
                backgroundColor: searchMode === 'description' ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Поиск по описанию
            </button>
          </div>

          {searchMode === 'name' ? (
            <input
              type="text"
              placeholder={`Поиск ${config.title.toLowerCase()} по названию`}
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
          ) : (
            <input
              type="text"
              placeholder={`Поиск ${config.title.toLowerCase()} по описанию`}
              value={searchDescriptionTerm}
              onChange={(e) => setSearchDescriptionTerm(e.target.value)}
              style={{
                padding: '10px',
                width: '100%',
                maxWidth: '500px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          )}
        </div>

        <div className="cards">
          {groups.map((group, index) => (
            <Card
              key={index}
              image={group.image}
              title={group.name || 'Без названия'}
              category={config.title}
              description={group.description || 'Описание отсутствует'}
            />
          ))}
        </div>

        <AddGroupButton
          onAddGroup={handleAddGroup}
        />
      </div>
    </div>
  );
};

export default GroupPage;
