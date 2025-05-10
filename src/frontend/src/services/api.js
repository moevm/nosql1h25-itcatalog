const API_BASE_URL = 'http://localhost:8000/api'; // URL

export const fetchProfessions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/professions`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching professions:', error);
    throw error;
  }
};

export const fetchTools = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tools`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw error;
  }
};

export const fetchTechnologies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/technologies`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching technologies:', error);
    throw error;
  }
};

export const fetchSkills = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/skills`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
};

export const fetchGroups = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${type}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type} groups:`, error);
    throw error;
  }
};


export const fetchProfessionById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/professions/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json(); 
  } catch (error) {
    console.error(`Error fetching profession with ID ${id}:`, error);
    throw error;
  }
};

export const fetchSkillById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/skills/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json(); 
  } catch (error) {
    console.error(`Error fetching skill with ID ${id}:`, error);
    throw error;
  }
};

export const fetchToolById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tools/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json(); 
  } catch (error) {
    console.error(`Error fetching tool with ID ${id}:`, error);
    throw error;
  }
};

export const fetchTechnologyById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/technologies/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json(); 
  } catch (error) {
    console.error(`Error fetching technology with ID ${id}:`, error);
    throw error;
  }
};

export const fetchProfessionsFilteredByCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/professions/filter/categories/${categoryId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching professions by category:', error);
    throw error;
  }
};

export const fetchProfessionsFilteredByTool = async (toolId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/professions/filter/tools/${toolId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching professions by tool:', error);
    throw error;
  }
};

export const fetchProfessionsFilteredByTechnology = async (techId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/professions/filter/technologies/${techId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching professions by technology:', error);
    throw error;
  }
};

export const fetchSkillsFilteredByGroup = async (groupName) => {
  try {
    const encodedGroup = encodeURIComponent(groupName); 
    const response = await fetch(`${API_BASE_URL}/skills/filter/skillgroups/${encodedGroup}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching skills by group:', error);
    throw error;
  }
};

export const fetchToolsFilteredByGroup = async (groupName) => {
  try {
    const encodedGroup = encodeURIComponent(groupName); 
    const response = await fetch(`${API_BASE_URL}/tools/filter/toolgroups/${encodedGroup}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tools by group:', error);
    throw error;
  }
};

export const fetchTechnologiesFilteredByGroup = async (groupName) => {
  try {
    const encodedGroup = encodeURIComponent(groupName); 
    const response = await fetch(`${API_BASE_URL}/technologies/filter/technologygroups/${encodedGroup}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching technologies by group:', error);
    throw error;
  }
};

export const searchProfessions = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/professions/search/by_name/${searchTerm}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error searching professions:', error);
    throw error;
  }
};

export const searchSkills = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/skills/search/by_name/${searchTerm}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error searching skills:', error);
    throw error;
  }
};

export const searchTechnologies = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/technologies/search/by_name/${searchTerm}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error searching technologies:', error);
    throw error;
  }
};

export const searchTechnologiesDescription = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/technologies/search/by_description/${searchTerm}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error searching technologies:', error);
    throw error;
  }
};

export const searchTools = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tools/search/by_name/${searchTerm}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error searching tools:', error);
    throw error;
  }
};

export const searchToolsDescription = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tools/search/by_description/${searchTerm}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error searching tools:', error);
    throw error;
  }
};

export const searchGroups = async (groupType, searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${groupType}/search/by_name/${searchTerm}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error(`Error searching ${groupType}:`, error);
    throw error;
  }
};

export const searchGroupsDescription = async (groupType, searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${groupType}/search/by_description/${searchTerm}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error(`Error searching ${groupType}:`, error);
    throw error;
  }
};

export const add = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error adding the card:', error);
    throw error;
  }
};

export const getIdByName = async (name) => {
  try {
    const encodedName = encodeURIComponent(name);
    const url = `${API_BASE_URL}/get_id?name=${encodedName}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    
    return (await response.json()).id;
  } catch (error) {
    console.error(`Failed to get ID for "${name}":`, error);
    throw error;
  }
};

export const fetchGraph = async (filter = "") => {
  const VALID_FILTERS = ["", "/professions", "/skills", "/technologies", "/tools", "/categories", "/skillgroups", "/technologygroups", "/toolgroups"];
  try {
    if (!VALID_FILTERS.includes(filter)) {
      throw new Error(`Invalid filter value: ${filter}. Expected one of: ${VALID_FILTERS.join(", ")}`);
    }

    const response = await fetch(`${API_BASE_URL}/graph${filter}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
    
  } catch (error) {
    console.error(`Error fetching graph:`, error);
    throw error;
  }
};

export const fetchProfessionDetails = async (name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/professions/${name}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return {
      ...data,
      skills: data.skills || [],
      technologies: data.technologies || [],
      tools: data.tools || [],
      description: data.description || 'Описание отсутствует'
    };
  } catch (error) {
    console.error('Error fetching profession details:', error);
    throw error;
  }
};

export const getToolDetails = async (toolName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tools/${toolName}`);
    if (!response.ok) {
      throw new Error('Инструмент не найден');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tool details:', error);
    throw error;
  }
};

export const getSkillDetails = async (skillName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/skills/${skillName}`);
    if (!response.ok) {
      throw new Error('Навык не найден');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching skill details:', error);
    throw error;
  }
};

export const getTechnologyDetails = async (techName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/technologies/${techName}`);
    if (!response.ok) {
      throw new Error('Технология не найдена');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching technology details:', error);
    throw error;
  }
};

export const getGroupDetails = async (groupName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/name/${encodeURIComponent(groupName)}`);
    if (!response.ok) {
      throw new Error('Группа не найдена');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching group details:', error);
    throw error;
  }
};

export const editCard = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/edit`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to edit card');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error editing card:', error);
    throw error;
  }
};


export const exportCatalog = async (fileName) => {
  try {
    console.log(`Starting export with filename: ${fileName}`);
    
    const response = await fetch(`${API_BASE_URL}/export`);

    if (!response.ok) {
      throw new Error(`Export failed with status: ${response.status}`);
    }

    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    a.download = `${fileName || 'export'}.zip`;
    
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('Export completed successfully');
    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};
