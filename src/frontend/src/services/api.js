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
    console.log(`Requesting ID for: ${encodedName}`); 

    const response = await fetch(`${API_BASE_URL}/get_id/${encodedName}`);

    if (!response.ok) {
      throw new Error(`Ошибка получения ID для "${name}" (код ${response.status})`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error(`Error getting ID for "${name}":`, error);
    throw error;
  }
};
