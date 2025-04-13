import React from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';

const technologiesData = [
  { title: 'JavaScript', category: 'Язык программирования' },
  { title: 'React', category: 'Фреймворк' },
  { title: 'Agile', category: 'Методология' },
  { title: 'Node.js', category: 'Платформа' },
  { title: 'Python', category: 'Язык программирования' },
  { title: 'Django', category: 'Фреймворк' },
];

const TechnologiesPage = () => {
  return (
    <div className="page">
      <div className="container">
        <Filters 
          categories={['Языки программирования', 'Фреймворки', 'Методологии', 'Платформы']}
          showSearch={true}
          searchPlaceholder="Введите текст для поиска"
          categoryLabel="Группа технологий"
        />
        <div className="cards">
          {technologiesData.map((tech, index) => (
            <Card
              key={index}
              image={tech.image}
              title={tech.title}
              category={tech.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnologiesPage;