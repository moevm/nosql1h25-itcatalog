import React, { useEffect, useState } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';
import { 
  fetchProfessions, 
  fetchGroups, 
  fetchTools, 
  fetchTechnologies,
  fetchProfessionsFilteredByCategory,
  fetchProfessionsFilteredByTool,
  fetchProfessionsFilteredByTechnology
} from '../../services/api';

const ProfessionsPage = () => {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [],
    tools: [],
    technologies: []
  });
  const [allCategories, setAllCategories] = useState([]);
  const [allTools, setAllTools] = useState([]);
  const [allTechnologies, setAllTechnologies] = useState([]);

  // Загрузка начальных данных
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [professionsData, categoriesData, toolsData, techData] = await Promise.all([
          fetchProfessions(),
          fetchGroups('categories'),
          fetchTools(),
          fetchTechnologies()
        ]);
        
        setProfessions(professionsData);
        setAllCategories(categoriesData);
        setAllTools(toolsData);
        setAllTechnologies(techData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Фильтрация профессий
  useEffect(() => {
    const filterProfessions = async () => {
      try {
        setLoading(true);
        let filteredProfessions = [];
        
        if (filters.categories.length > 0 || filters.tools.length > 0 || filters.technologies.length > 0) {
          const categoryPromises = filters.categories.map(catId => 
            fetchProfessionsFilteredByCategory(catId)
          );
          
          const toolPromises = filters.tools.map(toolId => 
            fetchProfessionsFilteredByTool(toolId)
          );
          
          const techPromises = filters.technologies.map(techId => 
            fetchProfessionsFilteredByTechnology(techId)
          );
          
          const [categoryResults, toolResults, techResults] = await Promise.all([
            Promise.all(categoryPromises),
            Promise.all(toolPromises),
            Promise.all(techPromises)
          ]);
          
          const allResults = [
            ...categoryResults.flat(),
            ...toolResults.flat(),
            ...techResults.flat()
          ];
          
          filteredProfessions = allResults.filter((prof, index, self) =>
            index === self.findIndex(p => p.profession === prof.profession)
          );
        } else {
          filteredProfessions = await fetchProfessions();
        }

        setProfessions(filteredProfessions);
      } catch (error) {
        console.error('Error filtering professions:', error);
      } finally {
        setLoading(false);
      }
    };

    filterProfessions();
  }, [filters]);

  const handleFilterChange = (type, id) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }));
  };

  return (
    <div className="page active">
      <div className="container">
        <Filters 
          categories={allCategories} 
          tools={allTools} 
          technologies={allTechnologies} 
          selectedFilters={filters}
          onFilterChange={handleFilterChange}
          showSearch={true}  
        />

        {loading ? (
          <p>Загрузка...</p>
        ) : professions.length === 0 ? (
          <p>Профессии не найдены.</p>
        ) : (
          <div className="cards">
            {professions.map((profession) => (
              <Card
                key={profession.id}
                image={profession.image || '/static/images/default.png'}
                title={profession.profession}
                category={profession.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionsPage;
