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
  const [searchQuery, setSearchQuery] = useState('');
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
        
        // Если есть активные фильтры
        if (filters.categories.length > 0 || filters.tools.length > 0 || filters.technologies.length > 0) {
          const promises = [];
          
          // Фильтрация по категориям
          filters.categories.forEach(catId => {
            promises.push(fetchProfessionsFilteredByCategory(catId));
          });
          
          // Фильтрация по инструментам
          filters.tools.forEach(toolId => {
            promises.push(fetchProfessionsFilteredByTool(toolId));
          });
          
          // Фильтрация по технологиям
          filters.technologies.forEach(techId => {
            promises.push(fetchProfessionsFilteredByTechnology(techId));
          });
          
          const results = await Promise.all(promises);
          filteredProfessions = results.flat();

          filteredProfessions = filteredProfessions.filter((p, index, self) =>
            index === self.findIndex(prof => prof.id === p.id)
          );
        } else {
          filteredProfessions = await fetchProfessions();
        }

        if (searchQuery) {
          filteredProfessions = filteredProfessions.filter(p =>
            p.profession.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setProfessions(filteredProfessions);
      } catch (error) {
        console.error('Error filtering professions:', error);
      } finally {
        setLoading(false);
      }
    };

    filterProfessions();
  }, [filters, searchQuery]);

  const handleFilterChange = (type, id) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }));
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
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
          onSearchChange={handleSearchChange}
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
