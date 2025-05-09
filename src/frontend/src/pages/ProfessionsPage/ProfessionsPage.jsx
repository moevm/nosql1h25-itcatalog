import React, { useEffect, useState } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';
import AddButton from '../../components/AddButton/AddButton';
import ProfessionModal from '../../components/ProfessionModal/ProfessionModal';
import { v4 as uuidv4 } from 'uuid';

import { 
  fetchProfessions, 
  fetchGroups, 
  fetchTools, 
  fetchTechnologies,
  fetchSkills,
  fetchProfessionsFilteredByCategory,
  fetchProfessionsFilteredByTool,
  fetchProfessionsFilteredByTechnology,
  searchProfessions,
  add,
  editCard,
  getIdByName,
  fetchProfessionDetails
} from '../../services/api';

const ProfessionsPage = () => {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [],
    tools: [],
    technologies: []
  });
  const [allCategories, setAllCategories] = useState([]);
  const [allTools, setAllTools] = useState([]);
  const [allTechnologies, setAllTechnologies] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [professionsData, categoriesData, toolsData, techData, skillsData] = await Promise.all([
          fetchProfessions(),
          fetchGroups('categories'),
          fetchTools(),
          fetchTechnologies(),
          fetchSkills()
        ]);
        
        setProfessions(professionsData);
        setAllCategories(categoriesData);
        setAllTools(toolsData);
        setAllTechnologies(techData);
        setAllSkills(skillsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const filterProfessions = async () => {
      try {
        setLoading(true);
        let filteredProfessions = [];
        
        if (searchTerm && searchTerm.trim() !== '') {
          filteredProfessions = await searchProfessions(searchTerm);
          
          if (filters.categories.length > 0 || filters.tools.length > 0 || filters.technologies.length > 0) {
            let filteredByCategories = [];
            let filteredByTools = [];
            let filteredByTechnologies = [];
            
            if (filters.categories.length > 0) {
              const categoryPromises = filters.categories.map(catId => 
                fetchProfessionsFilteredByCategory(catId)
              );
              filteredByCategories = (await Promise.all(categoryPromises)).flat();
            }
            
            if (filters.tools.length > 0) {
              const toolPromises = filters.tools.map(toolId => 
                fetchProfessionsFilteredByTool(toolId)
              );
              filteredByTools = (await Promise.all(toolPromises)).flat();
            }
            
            if (filters.technologies.length > 0) {
              const techPromises = filters.technologies.map(techId => 
                fetchProfessionsFilteredByTechnology(techId)
              );
              filteredByTechnologies = (await Promise.all(techPromises)).flat();
            }
            
            const allFilteredResults = [
              ...filteredByCategories,
              ...filteredByTools,
              ...filteredByTechnologies
            ];
            
            filteredProfessions = filteredProfessions.filter(searchProf => 
              allFilteredResults.some(filterProf => 
                filterProf.profession === searchProf.profession
              )
            );
          }
        } else if (filters.categories.length > 0 || filters.tools.length > 0 || filters.technologies.length > 0) {
          const categoryPromises = filters.categories.map(catId => 
            fetchProfessionsFilteredByCategory(catId)
          );
          
          const toolPromises = filters.tools.map(toolId => 
            fetchProfessionsFilteredByTool(toolId)
          );
          
          const techPromises = filters.technologies.map(techId => 
            fetchProfessionsFilteredByTechnology(techId)
          );
          
          const [categoryResults, toolResults, techResults] = await Promise.all([
            Promise.all(categoryPromises),
            Promise.all(toolPromises),
            Promise.all(techPromises)
          ]);
          
          const allResults = [
            ...categoryResults.flat(),
            ...toolResults.flat(),
            ...techResults.flat()
          ];
          
          filteredProfessions = allResults.filter((prof, index, self) =>
            index === self.findIndex(p => p.profession === prof.profession)
          );
        } else {
          filteredProfessions = await fetchProfessions();
        }
        
        setProfessions(filteredProfessions);
      } catch (error) {
        console.error('Error filtering professions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    filterProfessions();
  }, [filters, searchTerm]);

  const handleFilterChange = (type, id) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }));
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleCardClick = async (professionName) => {
    try {
      setLoading(true);
      const professionData = await fetchProfessionDetails(professionName);
      setSelectedProfession(professionData);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching profession details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfession = async (professionData) => {
    try {
      setLoading(true);
  
      const professionName = professionData.profession;
      const categoryName = professionData.category;
      const skills = professionData.skills || [];
      const technologies = professionData.technologies || [];
      const tools = professionData.tools || [];
  
      const professionId = uuidv4();
  
      const category = allCategories.find(cat => 
        cat.name === categoryName || cat.category === categoryName
      );
      const categoryId = category?.id || await getIdByName(categoryName);
      
      const skillIds = await Promise.all(skills.map(getIdByName));
      const techIds = await Promise.all(technologies.map(getIdByName));
      const toolIds = await Promise.all(tools.map(getIdByName));
  
      const nodes = [
        {
          label: "Profession",
          properties: {
            id: professionId,
            name: professionName,
            image: professionData.image?.name || "default.png",
          },
        },
      ];
  
      const relationships = [
        {
          startNode: professionId,
          endNode: categoryId,
          type: "BELONGS_TO",
        },
        ...skillIds.map((id) => ({
          startNode: professionId,
          endNode: id,
          type: "REQUIRES",
        })),
        ...techIds.map((id) => ({
          startNode: professionId,
          endNode: id,
          type: "USES_TECH",
        })),
        ...toolIds.map((id) => ({
          startNode: professionId,
          endNode: id,
          type: "USES_TOOL",
        })),
      ];
  
      const data = { nodes, relationships };
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");
  
      await add(formData);
  
      const newProfession = {
        profession: professionName,
        category: categoryName,
        image: professionData.image?.name || '/static/images/default.png',
      };
  
      setProfessions((prev) => [...prev, newProfession]);
  
    } catch (error) {
      console.error("Ошибка при добавлении профессии:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfession = async (formData) => {
    try {
      setLoading(true);
      await editCard(formData);
      const updatedProfessions = await fetchProfessions();
      setProfessions(updatedProfessions);
      
      if (selectedProfession) {
        const updatedProfession = updatedProfessions.find(p => 
          p.profession === selectedProfession.profession
        );
        if (updatedProfession) {
          setSelectedProfession(updatedProfession);
        }
      }
    } catch (error) {
      console.error('Error editing profession:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="container">
        <Filters 
          categories={allCategories.map(cat => cat.name || cat.category || cat)} 
          tools={allTools} 
          technologies={allTechnologies} 
          selectedFilters={filters}
          onFilterChange={handleFilterChange}
          showSearch={true}
          searchPlaceholder="Поиск профессий..."  
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />

        {loading ? (
          <p>Загрузка...</p>
        ) : professions.length === 0 ? (
          <p>Профессии не найдены.</p>
        ) : (
          <div className="cards">
            {professions.map((profession, index) => (
              <Card
                key={index}
                image={profession.image || '/static/images/default.png'}
                title={profession.profession}
                category={profession.category}
                onClick={() => handleCardClick(profession.profession)}
              />
            ))}
          </div>
        )}

        <AddButton 
          categories={allCategories.map(cat => cat.name || cat.category || cat)}
          skills={allSkills}
          technologies={allTechnologies}
          tools={allTools}
          onAddProfession={handleAddProfession}
        />

        {isModalOpen && (
          <ProfessionModal 
            profession={selectedProfession} 
            onClose={() => setIsModalOpen(false)}
            onEdit={handleEditProfession}
            allSkills={allSkills}
            allTechnologies={allTechnologies}
            allTools={allTools}
            setSelectedProfession={setSelectedProfession}
          />
        )}
      </div>
    </div>
  );
};

export default ProfessionsPage;
