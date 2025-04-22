import React, { useEffect, useState } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';
import AddButton from '../../components/AddButton/AddButton';
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
  addProfession
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

  // Загрузка начальных данных
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
        } 

        else if (filters.categories.length > 0 || filters.tools.length > 0 || filters.technologies.length > 0) {
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
        } 

        else {
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

 const handleAddProfession = async (professionData) => {
    try {
      setLoading(true);
  
      const data = {
        nodes: [
          {
            label: "Profession",
            properties: {
              name: professionData.profession,
              category: professionData.category,
              image: professionData.image?.name || "default.png",
            },
          },
          ...professionData.skills.map(skill => ({
            label: "Skill",
            properties: { name: skill },
          })),
          ...professionData.technologies.map(tech => ({
            label: "Technology",
            properties: { name: tech },
          })),
          ...professionData.tools.map(tool => ({
            label: "Tool",
            properties: { name: tool },
          })),
        ],
        relationships: [
          ...professionData.skills.map(skill => ({
            startNode: { label: "Profession", name: professionData.profession },
            endNode: { label: "Skill", name: skill },
            type: "HAS_SKILL",
          })),
          ...professionData.technologies.map(tech => ({
            startNode: { label: "Profession", name: professionData.profession },
            endNode: { label: "Technology", name: tech },
            type: "USES_TECHNOLOGY",
          })),
          ...professionData.tools.map(tool => ({
            startNode: { label: "Profession", name: professionData.profession },
            endNode: { label: "Tool", name: tool },
            type: "USES_TOOL",
          })),
        ],
      };
  
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "data.json");
  
      await addProfession(formData);
  
      const newProfession = {
        profession: professionData.profession,
        category: professionData.category,
        image: professionData.image?.name || '/static/images/default.png',
      };
  
      setProfessions(prev => [...prev, newProfession]);
    } catch (error) {
      console.error("Ошибка при добавлении профессии:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="page active">
      <div className="container">
        <Filters 
          categories={allCategories} 
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
              />
            ))}
          </div>
        )}

        <AddButton 
          categories={allCategories}
          skills={allSkills}
          technologies={allTechnologies}
          tools={allTools}
          onAddProfession={handleAddProfession}
        />
      </div>
    </div>
  );
};

export default ProfessionsPage;
