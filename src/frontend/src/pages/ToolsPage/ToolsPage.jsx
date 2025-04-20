import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import { fetchTools, fetchGroups, fetchToolsFilteredByGroup } from '../../services/api';

const ToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    const filterTools = async () => {
      try {
        setLoading(true);
        let filteredTools = [];
        
        if (selectedGroups.length > 0) {
          const groupPromises = selectedGroups.map(groupName => 
            fetchToolsFilteredByGroup(groupName)
          );
          
          const groupResults = await Promise.all(groupPromises);
          filteredTools = [...new Set(groupResults.flat())];
        } else {
          filteredTools = await fetchTools();
        }

        if (searchTerm) {
          filteredTools = filteredTools.filter(tool => 
            tool.tool && tool.tool.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setTools(filteredTools);
      } catch (error) {
        console.error('Error filtering tools:', error);
        setError('Ошибка при фильтрации инструментов');
        const allTools = await fetchTools();
        setTools(allTools);
      } finally {
        setLoading(false);
      }
    };

    filterTools();
  }, [selectedGroups, searchTerm]);

  const handleGroupChange = (groupName) => {
    setSelectedGroups(prev => 
      prev.includes(groupName)
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
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
          onSearchChange={setSearchTerm}
          showSearch={true}
          searchPlaceholder="Поиск инструментов..."
          groupLabel="Группы инструментов"
        />
        <div className="cards">
          {tools.map((tool, index) => (
            <Card
              key={index}
              image={tool.image ? tool.image : '/static/images/default.png'}
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
