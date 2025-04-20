import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import { fetchSkills, fetchGroups, fetchSkillsFilteredByGroup, searchSkills } from '../../services/api';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [skillsData, groupsData] = await Promise.all([
          fetchSkills(),
          fetchGroups('skillgroups')
        ]);
        setSkills(skillsData);
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
    const filterSkills = async () => {
      try {
        setLoading(true);
        let filteredSkills = [];
        
        if (searchTerm && searchTerm.trim() !== '') {
          filteredSkills = await searchSkills(searchTerm);
          
          if (selectedGroups.length > 0) {
            filteredSkills = filteredSkills.filter(skill => 
              selectedGroups.includes(skill.skill_group)
            );
          }
        } else if (selectedGroups.length > 0) {
          const groupPromises = selectedGroups.map(groupName => 
            fetchSkillsFilteredByGroup(groupName)
          );
          
          const groupResults = await Promise.all(groupPromises);
          filteredSkills = [...new Set(groupResults.flat())];
        } else {
          filteredSkills = await fetchSkills();
        }

        setSkills(filteredSkills);
      } catch (error) {
        console.error('Error filtering skills:', error);
        setError('Ошибка при фильтрации навыков');
        try {
          const allSkills = await fetchSkills();
          setSkills(allSkills);
        } catch (err) {
          console.error('Failed to load skills after error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    filterSkills();
  }, [selectedGroups, searchTerm]);

  const handleGroupChange = (groupName) => {
    setSelectedGroups(prev => 
      prev.includes(groupName)
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

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
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
          showSearch={true}
          searchPlaceholder="Поиск навыков..."
          groupLabel="Группы навыков"
        />
        <div className="cards">
          {skills.map((skill, index) => (
            <Card
              key={index}
              title={skill.skill}
              category={skill.skill_group}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
