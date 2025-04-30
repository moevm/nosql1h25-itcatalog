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
  const [searchNameTerm, setSearchNameTerm] = useState('');
  const [searchDescriptionTerm, setSearchDescriptionTerm] = useState('');

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
        
        if (selectedGroups.length > 0) {
          const groupPromises = selectedGroups.map(group => 
            fetchTechnologiesFilteredByGroup(group.name)
          );
          const groupResults = await Promise.all(groupPromises);
          filteredTechnologies = groupResults.flat();
        } else {
          filteredTechnologies = await fetchTechnologies();
        }

        if (searchNameTerm.trim() !== '') {
          const nameSearchResults = await searchTechnologies(searchNameTerm);
          filteredTechnologies = filteredTechnologies.filter(tech => 
            nameSearchResults.some(result => result.technology === tech.technology)
          );
        }

        if (searchDescriptionTerm.trim() !== '') {
          const descSearchResults = await searchTechnologiesDescription(searchDescriptionTerm);
          filteredTechnologies = filteredTechnologies.filter(tech => 
            descSearchResults.some(result => result.technology === tech.technology)
          );
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
  }, [selectedGroups, searchNameTerm, searchDescriptionTerm]);

  const handleGroupChange = (group) => {
    setSelectedGroups(prev => 
      prev.some(g => g.name === group.name)
        ? prev.filter(g => g.name !== group.name)
        : [...prev, group]
    );
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
        <div className="search-container" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Поиск технологий по названию..."
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
            placeholder="Поиск технологий по описанию..."
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

        <Filters 
          items={groups}
          selectedItems={selectedGroups}
          onItemChange={handleGroupChange}
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
