import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';
import { fetchSkills, fetchGroups } from '../../services/api';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="page">
      <div className="container">
        <Filters 
          categories={groups}
          showSearch={true}
          searchPlaceholder="Введите текст для поиска"
          categoryLabel="Группы навыков"
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
