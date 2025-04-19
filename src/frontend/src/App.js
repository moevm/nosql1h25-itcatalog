import React, { useState } from 'react';
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

function App() {
  const [activePage, setActivePage] = useState('professions');
  const [activeGroup, setActiveGroup] = useState(null);

  const showPage = (page) => {
    setActivePage(page);
    setActiveGroup(null);
  };

  const showGroup = (group) => {
    setActiveGroup(group);
    setActivePage(null);
  };

  const renderPage = () => {
    if (activeGroup) {
      return <GroupPage groupType={activeGroup} />;
    } else {
      switch (activePage) {
        case 'professions': return <ProfessionsPage />;
        case 'graph': return <GraphPage />;
        case 'tools': return <ToolsPage />;
        case 'technologies': return <TechnologiesPage />;
        case 'skills': return <SkillsPage />;
        default: return <ProfessionsPage />;
      }
    }
  };

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
      {renderPage()}
      <Pagination />
    </div>
  );
}

export default App;
