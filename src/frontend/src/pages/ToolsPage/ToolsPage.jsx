import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';
import { fetchTools, fetchGroups } from '../../services/api';

const ToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [toolsData, groupsData] = await Promise.all([
          fetchTools(),
          fetchGroups('toolgroups')
        ]);
        setTools(toolsData);
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
          categoryLabel="Группа инструментов"
        />
        <div className="cards">
          {tools.map((tool, index) => (
            <Card
              key={index}
              title={tool.tool}
              category={tool.tool_group}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
