import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import { 
  fetchTechnologies, 
  fetchGroups, 
  fetchTechnologiesFilteredByGroup,
  searchTechnologies 
} from '../../services/api';

const TechnologiesPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Загрузка начальных данных
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

  // Фильтрация и поиск технологий
  useEffect(() => {
    const filterTechnologies = async () => {
      try {
        setLoading(true);
        let filteredTechnologies = [];
        
        // Если задан поисковый запрос
        if (searchTerm && searchTerm.trim() !== '') {
          filteredTechnologies = await searchTechnologies(searchTerm);
          
          // Если выбраны группы, дополнительно фильтруем результаты поиска
          if (selectedGroups.length > 0) {
            filteredTechnologies = filteredTechnologies.filter(tech => 
              selectedGroups.includes(tech.technology_group)
            );
          }
        }
        // Если заданы только группы
        else if (selectedGroups.length > 0) {
          const groupPromises = selectedGroups.map(groupName => 
            fetchTechnologiesFilteredByGroup(groupName)
          );
          
          const groupResults = await Promise.all(groupPromises);
          filteredTechnologies = groupResults.flat();
        }
        // Если нет ни поиска, ни фильтров
        else {
          filteredTechnologies = await fetchTechnologies();
        }

        setTechnologies(filteredTechnologies);
      } catch (error) {
        console.error('Error filtering technologies:', error);
        setError('Ошибка при фильтрации технологий');
        try {
          // При ошибке загружаем все технологии
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
  }, [selectedGroups, searchTerm]);

  // Обработчик изменения выбранных групп
  const handleGroupChange = (groupName) => {
    setSelectedGroups(prev => 
      prev.includes(groupName)
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="page">
      <div className="container">
        <Filters 
          groups={groups}
          selectedGroups={selectedGroups}
          onGroupChange={handleGroupChange}
          onSearchChange={handleSearchChange} // Передаем функцию обработки поиска
          searchTerm={searchTerm} // Передаем текущее значение поиска
          showSearch={true}
          searchPlaceholder="Поиск технологий..."
          groupLabel="Группы технологий"
        />
        <div className="cards">
          {technologies.map((tech, index) => (
            <Card
              key={index}
              image={tech.image ? tech.image : '/static/images/default.png'}
              title={tech.technology}
              category={tech.technology_group}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnologiesPage;
