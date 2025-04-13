import React from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';

const toolsData = [
  { title: 'Visual Studio Code', category: 'IDE' },
  { title: 'Git', category: 'Система контроля версий' },
  { title: 'Figma', category: 'Графический редактор' },
  { title: 'PostgreSQL', category: 'База данных' },
  { title: 'Docker', category: 'Виртуализация' },
  { title: 'Jira', category: 'Управление проектами' },
];

const ToolsPage = () => {
  return (
    <div className="page">
      <div className="container">
        <Filters 
          categories={['IDE', 'Системы контроля версий', 'Графические редакторы', 'Базы данных']}
          showSearch={true}
          searchPlaceholder="Введите текст для поиска"
          categoryLabel="Группа инструментов"
        />
        <div className="cards">
          {toolsData.map((tool, index) => (
            <Card
              key={index}
              image={tool.image}
              title={tool.title}
              category={tool.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;