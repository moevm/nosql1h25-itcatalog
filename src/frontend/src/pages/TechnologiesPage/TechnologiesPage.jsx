import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import AddTechnologyButton from '../../components/AddTechnologyButton/AddTechnologyButton';
import TechnologyModal from '../../components/TechnologyModal/TechnologyModal';
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchTechnologies, 
  fetchGroups, 
  fetchTechnologiesFilteredByGroup,
  searchTechnologies,
  searchTechnologiesDescription,
  getIdByName,
  add,
  getTechnologyDetails,
  editTechnology
} from '../../services/api';

const TechnologiesPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchNameTerm, setSearchNameTerm] = useState('');
  const [searchDescriptionTerm, setSearchDescriptionTerm] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [modalLoading, setModalLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCardClick = async (tech) => {
    try {
      setModalLoading(true);
      const techDetails = await getTechnologyDetails(tech.technology);
      setSelectedTechnology(techDetails);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching technology details:', error);
      setError('Не удалось загрузить данные технологии');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditTechnology = async (formData) => {
    try {
      setLoading(true);
      await editTechnology(formData);
      const updatedTechnologies = await fetchTechnologies();
      setTechnologies(updatedTechnologies);
    } catch (error) {
      console.error('Error editing technology:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTechnology(null);
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
            <div key={index} onClick={() => handleCardClick(tech)} style={{ cursor: 'pointer' }}>
              <Card
                image={tech.image ? tech.image : '/static/images/default.png'}
                title={tech.technology}
                category={tech.technology_group}
                description={tech.description}
              />
            </div>
          ))}
        </div>

        <AddTechnologyButton 
          groups={groups.map(g => g.name)}
          onAddTechnology={handleAddTechnology}
        />

        {isModalOpen && selectedTechnology && (
          <TechnologyModal
            technology={selectedTechnology}
            onClose={() => setIsModalOpen(false)}
            onEdit={handleEditTechnology}
            allGroups={groups}
            loading={modalLoading}
          />
        )}
      </div>
    </div>
  );
};

export default TechnologiesPage;
