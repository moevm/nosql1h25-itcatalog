import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import AddToolButton from '../../components/AddToolButton/AddToolButton';
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchTools, 
  fetchGroups, 
  fetchToolsFilteredByGroup, 
  searchTools,
  add,
  getIdByName
} from '../../services/api';

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
        
        if (searchTerm && searchTerm.trim() !== '') {
          filteredTools = await searchTools(searchTerm);
          
          if (selectedGroups.length > 0) {
            filteredTools = filteredTools.filter(tool => 
              selectedGroups.some(group => group.name === tool.tool_group)
            );
          }
        } else if (selectedGroups.length > 0) {
          const groupPromises = selectedGroups.map(group => 
            fetchToolsFilteredByGroup(group.name)
          );
          
          const groupResults = await Promise.all(groupPromises);
          filteredTools = [...new Set(groupResults.flat())];
        } else {
          filteredTools = await fetchTools();
        }

        setTools(filteredTools);
      } catch (error) {
        console.error('Error filtering tools:', error);
        setError('Ошибка при фильтрации инструментов');
        try {
          const allTools = await fetchTools();
          setTools(allTools);
        } catch (err) {
          console.error('Failed to load tools after error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    filterTools();
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

  const handleAddTool = async (toolData) => {
    try {
      setLoading(true);
  
      const toolName = toolData.name;
      const groupName = toolData.group;
      const description = toolData.description;
  
      const toolId = uuidv4();
      
      const group = groups.find(g => g.name === groupName);
      const groupId = group?.id || await getIdByName(groupName);
  
      const nodes = [
        {
          label: "Tool",
          properties: {
            id: toolId,
            name: toolName,
            image: toolData.image?.name || "default.png",
            description: description || "",
          },
        },
      ];
  
      const relationships = [
        {
          startNode: toolId,
          endNode: groupId,
          type: "GROUPS_TOOL",
        }
      ];
  
      const data = { nodes, relationships };
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");
  
      if (toolData.image) {
        formData.append("image", toolData.image);
      }
  
      await add(formData);
  
      const newTool = {
        tool: toolName,
        tool_group: groupName,
        image: toolData.image?.name || '/static/images/default.png',
        description: description
      };
  
      setTools(prev => [...prev, newTool]);
  
    } catch (error) {
      console.error("Ошибка при добавлении инструмента:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="page active">
      <div className="container">
        <Filters 
          items={groups}
          selectedItems={selectedGroups}
          onItemChange={handleGroupChange}
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
          showSearch={true}
          searchPlaceholder="Поиск инструментов..."
          filterLabel="Группы инструментов"
          itemLabelProp="name"
        />
        <div className="cards">
          {tools.map((tool, index) => (
            <Card
              key={index}
              image={tool.image ? tool.image : '/static/images/default.png'}
              title={tool.tool}
              category={tool.tool_group}
              description={tool.description}
            />
          ))}
        </div>

        <AddToolButton 
          groups={groups.map(g => g.name)}
          onAddTool={handleAddTool}
        />
      </div>
    </div>
  );
};

export default ToolsPage;
