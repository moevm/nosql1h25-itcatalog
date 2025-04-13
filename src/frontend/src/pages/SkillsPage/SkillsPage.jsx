import React from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';

const skillsData = [
  { title: 'Коммуникация', category: 'Мягкие навыки' },
  { title: 'Работа в команде', category: 'Мягкие навыки' },
  { title: 'Алгоритмы', category: 'Технические навыки' },
  { title: 'Управление проектами', category: 'Управленческие навыки' },
  { title: 'Критическое мышление', category: 'Мягкие навыки' },
  { title: 'SQL', category: 'Технические навыки' },
];

const SkillsPage = () => {
  return (
    <div className="page">
      <div className="container">
        <Filters 
          categories={['Технические', 'Мягкие', 'Управленческие']}
          showSearch={true}
          searchPlaceholder="Введите текст для поиска"
          categoryLabel="Группы навыков"
        />
        <div className="cards">
          {skillsData.map((skill, index) => (
            <Card
              key={index}
              image={skill.image}
              title={skill.title}
              category={skill.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;