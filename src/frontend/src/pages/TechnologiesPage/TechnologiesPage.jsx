import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';
import { fetchTechnologies, fetchGroups } from '../../services/api';

const TechnologiesPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="page">
      <div className="container">
        <Filters 
          categories={groups}
          showSearch={true}
          searchPlaceholder="Введите текст для поиска"
          categoryLabel="Группа технологий"
        />
        <div className="cards">
          {technologies.map((tech, index) => (
            <Card
              key={index}
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
