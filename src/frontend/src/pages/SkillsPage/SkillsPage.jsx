import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import AddSkillButton from '../../components/AddSkillButton/AddSkillButton';
import { v4 as uuidv4 } from 'uuid';
import { fetchSkills, fetchGroups, fetchSkillsFilteredByGroup, searchSkills, getIdByName, add } from '../../services/api';

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
              selectedGroups.some(group => group.name === skill.skill_group)
            );
          }
        } else if (selectedGroups.length > 0) {
          const groupPromises = selectedGroups.map(group => 
            fetchSkillsFilteredByGroup(group.name)
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

  const handleGroupChange = (group) => {
    setSelectedGroups(prev => 
      prev.some(g => g.name === group.name)
        ? prev.filter(g => g.name !== group.name)
        : [...prev, group]
    );
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleAddSkill = async (skillData) => {
    try {
      setLoading(true);
    
      const skillName = skillData.name;
      const groupName = skillData.group;
    
      const skillId = uuidv4();
      const group = groups.find(g => g.name === groupName);
      const groupId = group?.id || await getIdByName(groupName);
    
      const nodes = [
        {
          label: "Skill",
          properties: {
            id: skillId,
            name: skillName,
            image: skillData.image?.name || "default.png",
          },
        },
      ];
    
      const relationships = [
        {
          startNode: skillId,
          endNode: groupId,
          type: "GROUPS_SKILL",
        }
      ];
    
      const data = { nodes, relationships };
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");
    
      if (skillData.image) {
        formData.append("image", skillData.image);
      }
    
      await add(formData);
    
      const newSkill = {
        skill: skillName,
        skill_group: groupName,
        image: skillData.image?.name || '/static/images/default.png'
      };
    
      setSkills(prev => [...prev, newSkill]);
    
    } catch (error) {
      console.error("Ошибка при добавлении навыка:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };  

  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="page">
      <div className="container">
        <Filters 
          items={groups}
          selectedItems={selectedGroups}
          onItemChange={handleGroupChange}
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
          showSearch={true}
          searchPlaceholder="Поиск навыков..."
          filterLabel="Группы навыков"
          itemLabelProp="name"
        />
        <div className="cards">
          {skills.map((skill, index) => (
            <Card
              key={index}
              title={skill.skill}
              category={skill.skill_group}
              image={skill.image}
            />
          ))}
        </div>

        <AddSkillButton 
          groups={groups.map(g => g.name)}
          onAddSkill={handleAddSkill}
        />
      </div>
    </div>
  );
};

export default SkillsPage;
