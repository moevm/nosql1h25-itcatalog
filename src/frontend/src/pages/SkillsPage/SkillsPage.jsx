import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import AddSkillButton from '../../components/AddSkillButton/AddSkillButton';
import SkillModal from '../../components/SkillModal/SkillModal';
import { v4 as uuidv4 } from 'uuid';

import { fetchSkills, fetchGroups, fetchSkillsFilteredByGroup, searchSkills, getIdByName, add, getSkillDetails, editCard } from '../../services/api';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null); 
  const [modalLoading, setModalLoading] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        image: skillData.image ? URL.createObjectURL(skillData.image) : '/static/images/default.png'
      };
    
      setSkills(prev => [...prev, newSkill]);
    
    } catch (error) {
      console.error("Ошибка при добавлении навыка:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };  

  const handleCardClick = async (skillName) => {
    try {
      setModalLoading(true);
      const skillDetails = await getSkillDetails(skillName);
      setSelectedSkill(skillDetails);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching skill details:', error);
      setError('Не удалось загрузить данные навыка');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditSkill = async (formData) => { 
      try {
        setLoading(true);
        await editCard(formData);
        const updatedSkills = await fetchSkills();
        setSkills(updatedSkills);
      } catch (error) {
        console.error('Error editing skill:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSkill(null);
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
          filteredCount={skills.length}
        />
        <div className="cards">
          {skills.map((skill, index) => (
            <div key={index} onClick={() => handleCardClick(skill.skill)} style={{ cursor: 'pointer' }}>
              <Card
                title={skill.skill}
                category={skill.skill_group}
                image={skill.image}
                time={skill.time}
              />
            </div>
          ))}
        </div>

        <AddSkillButton 
          groups={groups.map(g => g.name)}
          onAddSkill={handleAddSkill}
        />

        {isModalOpen && selectedSkill && (
          <SkillModal
            skill={selectedSkill}
            onClose={handleCloseModal}
            onEdit={handleEditSkill}
            allGroups={groups}
            loading={modalLoading}
          />
        )}
      </div>
    </div>
  );
};

export default SkillsPage;
