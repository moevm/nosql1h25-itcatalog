import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import { fetchSkills, fetchGroups, fetchSkillsFilteredByGroup, searchSkills, add } from '../../services/api';

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

  const handleAddSkill = async (skillsData)) => {
    try {
      setLoading(true);

      const data = {
        nodes: [
          {
            label: "Skill",
            properties: {
              name: skillsData.skill,
              description: skillsData.description,
              image: skillsData.image?.name || "default.png",
            },
          },
          ...skillsData.groups.map(group => ({
            label: "SkillGroup",
            properties: { name: group },
          })),
        ],
        relationships: [
          ...skillsData.skills.map(skill => ({
            startNode: { label: "Skill", name: skillsData.skill },
            endNode: { label: "SkillGroup", name: group },
            type: "GROUPS_SKILL",
          })),
        ],
      };

      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");

      await add(formData);

      const newSkill = {
        skill: skillsData.skill,
        description: skillsData.description,
        image: skillsData.image?.name || '/static/images/default.png',
      };

      setSkills(prev => [...prev, newSkill]);
    } catch (error) {
      console.error("Ошибка при добавлении навыка:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <AddButton
          groups={groups}
          onAddSkill={handleAddSkill}
        />
      </div>
    </div>
  );
};

export default SkillsPage;
