import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import ImportExportButtons from './components/ImportExportButtons/ImportExportButtons';
import ProfessionsPage from './pages/ProfessionsPage/ProfessionsPage';
import GraphPage from './pages/GraphPage/GraphPage';
import ToolsPage from './pages/ToolsPage/ToolsPage';
import TechnologiesPage from './pages/TechnologiesPage/TechnologiesPage';
import SkillsPage from './pages/SkillsPage/SkillsPage';
import GroupPage from './pages/GroupPage/GroupPage';
import Pagination from './components/Pagination/Pagination';

import './App.css';

function App() {
  const [activePage, setActivePage] = useState('professions');
  const [activeGroup, setActiveGroup] = useState(null);
  const [fadeClass, setFadeClass] = useState('fade-in');
  const [currentContent, setCurrentContent] = useState(renderPage('professions', null));

  function renderPage(page, group) {
    if (group) return <GroupPage groupType={group} />;
    switch (page) {
      case 'professions': return <ProfessionsPage />;
      case 'graph': return <GraphPage />;
      case 'tools': return <ToolsPage />;
      case 'technologies': return <TechnologiesPage />;
      case 'skills': return <SkillsPage />;
      default: return <ProfessionsPage />;
    }
  }

  const changeContent = (page, group = null) => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setActivePage(page);
      setActiveGroup(group);
      setCurrentContent(renderPage(page, group));
      setFadeClass('fade-in');
    }, 300); 
  };

  const showPage = (page) => changeContent(page, null);
  const showGroup = (group) => changeContent(null, group);

  return (
    <div className="app">
      <Header />
      <Navigation 
        showPage={showPage} 
        showGroup={showGroup} 
        activePage={activePage}
        activeGroup={activeGroup}
      />
      <ImportExportButtons />
      <div className={`fade-container ${fadeClass}`}>
        {currentContent}
      </div>
      <Pagination />
    </div>
  );
}

export default App;
