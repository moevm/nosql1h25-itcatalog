import React from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';

const professionsData = [
  { title: 'Бизнес-аналитик', category: 'Аналитика' },
  { title: 'CRM-специалист', category: 'Маркетинг' },
  { title: 'Продуктовый аналитик', category: 'Аналитика' },
  { title: 'Web-аналитик', category: 'IT' },
  { title: 'Security researcher', category: 'Кибербезопасность' },
  { title: 'Системный аналитик', category: 'IT' },
  { title: 'SEO-специалист', category: 'Маркетинг' },
  { title: 'SMM-специалист', category: 'Маркетинг' },
  { title: 'Контент-менеджер', category: 'Маркетинг' },
  { title: 'Фронтенд разработчик', category: 'IT' },
  { title: 'Бэкенд разработчик', category: 'IT' },
  { title: 'Копирайтер', category: 'Контент' },
];

const ProfessionsPage = () => {
  return (
    <div className="page active">
      <div className="container">
        <Filters 
          categories={[]}
          tools={[]}
          technologies={[]}
          showSearch={true}
        />
        <div className="cards">
          {professionsData.map((profession, index) => (
            <Card
              key={index}
              image={profession.image}
              title={profession.title}
              category={profession.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessionsPage;