import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import AddGroupButton from '../../components/AddGroupButton/AddGroupButton';
import GroupModal from '../../components/GroupModal/GroupModal';
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchGroups, 
  searchGroups, 
  searchGroupsDescription, 
  add,
  getGroupDetails,
  editCard
} from '../../services/api';

const GroupPage = ({ groupType }) => {
  const groupConfig = {
    professions: {
      title: 'Категории профессий',
      apiEndpoint: 'categories',
      defaultImage: '/images/default-category.png',
      label: 'Category',
      participantType: 'professions'
    },
    skills: {
      title: 'Группы навыков',
      apiEndpoint: 'skillgroups',
      defaultImage: '/images/default-skill.png',
      label: 'SkillGroup',
      participantType: 'skills'
    },
    technologies: {
      title: 'Группы технологий',
      apiEndpoint: 'technologygroups',
      defaultImage: '/images/default-technology.png',
      label: 'TechnologyGroup',
      participantType: 'technologies'
    },
    tools: {
      title: 'Группы инструментов',
      apiEndpoint: 'toolgroups',
      defaultImage: '/images/default-tool.png',
      label: 'ToolGroup',
      participantType: 'tools'
    }
  };

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchNameTerm, setSearchNameTerm] = useState('');
  const [searchDescriptionTerm, setSearchDescriptionTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const config = groupConfig[groupType] || groupConfig.professions;

  const normalizeGroup = (group) => {
    if (typeof group === 'string') {
      return {
        name: group,
        description: '',
        image: config.defaultImage,
        participants: [],
        time: '' 
      };
    }
  
    const name = group.name || group.group || 'Без названия';
  
    return {
      name,
      description: group.description || '',
      image: group.image || config.defaultImage,
      participants: group.participants || [],
      time: group.time || '' 
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const groupsData = await fetchGroups(config.apiEndpoint);
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
        let resultGroups = await fetchGroups(config.apiEndpoint);

        if (searchNameTerm.trim() !== '') {
          try {
            const nameSearchResults = await searchGroups(config.apiEndpoint, searchNameTerm);
            resultGroups = resultGroups.filter(group => 
              nameSearchResults.some(result => 
                (result.name || result.group) === (group.name || group.group)
              )
            );
          } catch (error) {
            console.error(`Error searching by name:`, error);
            resultGroups = [];
          }
        }

        if (searchDescriptionTerm.trim() !== '') {
          try {
            const descSearchResults = await searchGroupsDescription(config.apiEndpoint, searchDescriptionTerm);
            resultGroups = resultGroups.filter(group => 
              descSearchResults.some(result => 
                (result.name || result.group) === (group.name || group.group)
              )
            );
          } catch (error) {
            console.error(`Error searching by description:`, error);
            resultGroups = [];
          }
        }

        const normalizedGroups = resultGroups.map(normalizeGroup);
        setGroups(normalizedGroups);
        setError(null);
      } catch (error) {
        console.error(`Error searching ${config.apiEndpoint}:`, error);
        setError(`Ошибка при поиске ${config.title}`);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchGroupsHandler();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchNameTerm, searchDescriptionTerm, config.apiEndpoint, config.title, config.defaultImage]);

  const handleCardClick = async (groupName) => {
    try {
      setModalLoading(true);
      console.log('groupName', groupName);
      const groupDetails = await getGroupDetails(groupName);
      setSelectedGroup(normalizeGroup(groupDetails));
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching group details:', error);
      setError('Не удалось загрузить данные группы');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

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
          label: config.label,
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
        image: imageFile ? URL.createObjectURL(imageFile) : config.defaultImage,
        participants: []
      }]);

    } catch (error) {
      console.error("Ошибка при добавлении группы:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async ({ formData, oldName, newName }) => { 
    try {
      setLoading(true);
      const response = await editCard(formData);
      
      const updatedGroupDetails = await getGroupDetails(newName);
      const normalizedGroup = normalizeGroup(updatedGroupDetails);
      
      if (formData.has('image')) {
        normalizedGroup.image = URL.createObjectURL(formData.get('image'));
      }

      setSelectedGroup(normalizedGroup);
      
      const updatedGroups = await fetchGroups(config.apiEndpoint);
      setGroups(updatedGroups.map(normalizeGroup));
      
      return response;
    } catch (error) {
      console.error('Error editing group:', error);
      
      try {
        const fallbackGroupDetails = await getGroupDetails(oldName);
        const normalizedFallbackGroup = normalizeGroup(fallbackGroupDetails);
        setSelectedGroup(normalizedFallbackGroup);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
      
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
          <input
            type="text"
            placeholder={`Поиск ${config.title.toLowerCase()} по названию`}
            value={searchNameTerm}
            onChange={(e) => setSearchNameTerm(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginBottom: '10px'
            }}
          />
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
        </div>

        <div className="cards">
          {groups.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#666',
              fontSize: '16px'
            }}>
              {searchNameTerm || searchDescriptionTerm 
                ? `По вашему запросу не найдено ${config.title.toLowerCase()}`
                : `Нет доступных ${config.title.toLowerCase()}`
              }
            </div>
          ) : (
            groups.map((group, index) => (
              <div key={index} onClick={() => handleCardClick(group.name)} style={{ cursor: 'pointer' }}>
                <Card
                  image={group.image}
                  title={group.name || 'Без названия'}
                  category={config.title}
                  description={group.description || 'Описание отсутствует'}
                  time={group.time}
                />
              </div>
            ))
          )}
        </div>

        <AddGroupButton
          onAddGroup={handleAddGroup}
        />

        {isModalOpen && selectedGroup && (
          <GroupModal
            group={selectedGroup}
            onClose={handleCloseModal}
            onEdit={handleEditGroup}
            loading={modalLoading}
            groupType={config.title}
            label={config.label}
            participantType={config.participantType}
          />
        )}
      </div>
    </div>
  );
};

export default GroupPage;
