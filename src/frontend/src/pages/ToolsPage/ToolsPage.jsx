import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/GroupFilter';
import AddToolButton from '../../components/AddToolButton/AddToolButton';
import ToolModal from '../../components/ToolModal/ToolModal';
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchTools, 
  fetchGroups, 
  fetchToolsFilteredByGroup, 
  searchTools,
  searchToolsDescription,
  add,
  getIdByName,
  getToolDetails,
  editCard
} from '../../services/api';

const ToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchNameTerm, setSearchNameTerm] = useState('');
  const [searchDescriptionTerm, setSearchDescriptionTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState(null); 
  const [modalLoading, setModalLoading] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          const groupPromises = selectedGroups.map(group => 
            fetchToolsFilteredByGroup(group.name)
          );
          const groupResults = await Promise.all(groupPromises);
          filteredTools = [...new Set(groupResults.flat())];
        } else {
          filteredTools = await fetchTools();
        }

        if (searchNameTerm.trim() !== '') {
          const nameSearchResults = await searchTools(searchNameTerm);
          filteredTools = filteredTools.filter(tool => 
            nameSearchResults.some(result => result.tool === tool.tool)
          );
        }

        if (searchDescriptionTerm.trim() !== '') {
          const descSearchResults = await searchToolsDescription(searchDescriptionTerm);
          filteredTools = filteredTools.filter(tool => 
            descSearchResults.some(result => result.tool === tool.tool)
          );
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
  }, [selectedGroups, searchNameTerm, searchDescriptionTerm]);

  const handleGroupChange = (group) => {
    setSelectedGroups(prev => 
      prev.some(g => g.name === group.name)
        ? prev.filter(g => g.name !== group.name)
        : [...prev, group]
    );
  };

  const handleAddTool = async (toolData) => {
    try {
      setLoading(true);
  
      const toolName = toolData.name;
      const groupName = toolData.group;
      const description = toolData.description;
  
      const toolId = uuidv4();
      const groupId = await getIdByName(groupName);
  
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

  const handleCardClick = async (tool) => { 
    try {
      setModalLoading(true);
      const toolDetails = await getToolDetails(tool.tool); 
      setSelectedTool(toolDetails);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching tool details:', error);
      setError('Не удалось загрузить данные инструмента');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditTool = async (formData) => { 
    try {
      setLoading(true);
      await editCard(formData);
      const updatedTools = await fetchTools();
      setTools(updatedTools);
    } catch (error) {
      console.error('Error editing tool:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTool(null);
  };

  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="page active">
      <div className="container">
        <div className="search-container" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Поиск инструментов по названию..."
            value={searchNameTerm}
            onChange={(e) => setSearchNameTerm(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginBottom: '10px'
            }}
          />
          <input
            type="text"
            placeholder="Поиск инструментов по описанию..."
            value={searchDescriptionTerm}
            onChange={(e) => setSearchDescriptionTerm(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <Filters 
          items={groups}
          selectedItems={selectedGroups}
          onItemChange={handleGroupChange}
          filterLabel="Группы инструментов"
          itemLabelProp="name"
        />
        
        <div className="cards">
          {tools.map((tool, index) => (
            <div key={index} onClick={() => handleCardClick(tool)}> 
              <Card
                image={tool.image ? tool.image : '/static/images/default.png'}
                title={tool.tool}
                category={tool.tool_group}
                description={tool.description}
              />
            </div>
          ))}
        </div>

        <AddToolButton 
          groups={groups.map(g => g.name)}
          onAddTool={handleAddTool}
        />

        {isModalOpen && selectedTool && (
          <ToolModal
            tool={selectedTool}
            onClose={handleCloseModal}
            onEdit={handleEditTool}
            allGroups={groups}
            loading={modalLoading}
          />
        )}
      </div>
    </div>
  );
};

export default ToolsPage;
