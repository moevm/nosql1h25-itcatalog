import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import { fetchSkills, fetchGroups, fetchSkillsFilteredByGroup } from '../../services/api';

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
        
        if (selectedGroups.length > 0) {
          const groupPromises = selectedGroups.map(groupName => 
            fetchSkillsFilteredByGroup(groupName)
          );
          
          const groupResults = await Promise.all(groupPromises);
          filteredSkills = groupResults.flat();
        } else {
          filteredSkills = await fetchSkills();
        }

        if (searchTerm) {
          filteredSkills = filteredSkills.filter(skill => 
            skill.skill.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setSkills(filteredSkills);
      } catch (error) {
        console.error('Error filtering skills:', error);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="page">
      <div className="container">
        <Filters 
          groups={groups}
          selectedGroups={selectedGroups}
          onGroupChange={handleGroupChange}
          onSearchChange={setSearchTerm}
          showSearch={true}
          searchPlaceholder="Введите текст для поиска"
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
