import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import AddTechnologyButton from '../../components/AddTechnologyButton/AddTechnologyButton';
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchTechnologies, 
  fetchGroups, 
  fetchTechnologiesFilteredByGroup,
  searchTechnologies,
  searchTechnologiesDescription,
  getIdByName,
  add
} from '../../services/api';

const TechnologiesPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDescriptionTerm, setSearchDescriptionTerm] = useState('');
  const [searchMode, setSearchMode] = useState('name'); 

  useEffect(() => {
    const loadData = async () => {
      try {
        const [techData, groupsData] = await Promise.all([
          fetchTechnologies(),
          fetchGroups('technologygroups')
        ]);
        setTechnologies(techData);
        setGroups(groupsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const filterTechnologies = async () => {
      try {
        setLoading(true);
        let filteredTechnologies = [];
        
        if (searchTerm && searchTerm.trim() !== '' && searchMode === 'name') {
          filteredTechnologies = await searchTechnologies(searchTerm);
          
          if (selectedGroups.length > 0) {
            filteredTechnologies = filteredTechnologies.filter(tech => 
              selectedGroups.some(group => group.name === tech.technology_group)
            );
          }
        } 
        else if (searchDescriptionTerm && searchDescriptionTerm.trim() !== '' && searchMode === 'description') {
          filteredTechnologies = await searchTechnologiesDescription(searchDescriptionTerm);
          
          if (selectedGroups.length > 0) {
            filteredTechnologies = filteredTechnologies.filter(tech => 
              selectedGroups.some(group => group.name === tech.technology_group)
            );
          }
        }
        else if (selectedGroups.length > 0) {
          const groupPromises = selectedGroups.map(group => 
            fetchTechnologiesFilteredByGroup(group.name)
          );
          
          const groupResults = await Promise.all(groupPromises);
          filteredTechnologies = groupResults.flat();
        } else {
          filteredTechnologies = await fetchTechnologies();
        }

        setTechnologies(filteredTechnologies);
      } catch (error) {
        console.error('Error filtering technologies:', error);
        setError('Ошибка при фильтрации технологий');
        try {
          const allTechnologies = await fetchTechnologies();
          setTechnologies(allTechnologies);
        } catch (err) {
          console.error('Failed to load technologies after error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    filterTechnologies();
  }, [selectedGroups, searchTerm, searchDescriptionTerm, searchMode]);

  const handleGroupChange = (group) => {
    setSelectedGroups(prev => 
      prev.some(g => g.name === group.name)
        ? prev.filter(g => g.name !== group.name)
        : [...prev, group]
    );
  };

  const handleSearchChange = (term) => {
    if (searchMode === 'name') {
      setSearchTerm(term);
    } else {
      setSearchDescriptionTerm(term);
    }
  };

  const handleAddTechnology = async (technologyData) => {
    try {
      setLoading(true);
  
      const technologyName = technologyData.name;
      const groupName = technologyData.group;
      const description = technologyData.description;
  
      const technologyId = uuidv4();
      const groupId = await getIdByName(groupName);
  
      const nodes = [
        {
          label: "Technology",
          properties: {
            id: technologyId,
            name: technologyName,
            image: technologyData.image?.name || "default.png",
            description: description || "",
          },
        },
      ];
  
      const relationships = [
        {
          startNode: technologyId,
          endNode: groupId,
          type: "GROUPS_TECH",
        }
      ];
  
      const data = { nodes, relationships };
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");
  
      if (technologyData.image) {
        formData.append("image", technologyData.image);
      }
  
      await add(formData);
  
      const newTechnology = {
        technology: technologyName,
        technology_group: groupName,
        image: technologyData.image?.name || '/static/images/default.png',
        description: description
      };
  
      setTechnologies(prev => [...prev, newTechnology]);
  
    } catch (error) {
      console.error("Ошибка при добавлении технологий:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="page">
      <div className="container">
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

        <Filters 
          items={groups}
          selectedItems={selectedGroups}
          onItemChange={handleGroupChange}
          onSearchChange={handleSearchChange}
          searchTerm={searchMode === 'name' ? searchTerm : searchDescriptionTerm}
          showSearch={true}
          searchPlaceholder={searchMode === 'name' 
            ? "Поиск технологий по названию..." 
            : "Поиск технологий по описанию..."}
          filterLabel="Группы технологий"
          itemLabelProp="name"
        />
        <div className="cards">
          {technologies.map((tech, index) => (
            <Card
              key={index}
              image={tech.image ? tech.image : '/static/images/default.png'}
              title={tech.technology}
              category={tech.technology_group}
              description={tech.description}
            />
          ))}
        </div>

        <AddTechnologyButton 
          groups={groups.map(g => g.name)}
          onAddTechnology={handleAddTechnology}
        />
      </div>
    </div>
  );
};

export default TechnologiesPage;
