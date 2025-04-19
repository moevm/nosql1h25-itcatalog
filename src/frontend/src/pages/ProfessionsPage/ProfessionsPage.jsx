import React, { useEffect, useState } from 'react';
import Card from '../../components/Card/Card';
import Filters from '../../components/Filters/Filters';
import { fetchProfessions } from '../../services/api';

const ProfessionsPage = () => {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfessions = async () => {
      try {
        const data = await fetchProfessions();
        setProfessions(data);
      } catch (error) {
        console.error('Ошибка при получении профессий:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfessions();
  }, []);

  return (
    <div className="page active">
      <div className="container">
        <Filters 
          categories={[]} 
          tools={[]} 
          technologies={[]} 
          showSearch={true}
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
                image={profession.image ? profession.image : '/static/images/default.png'}
                title={profession.profession}
                category={profession.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionsPage;
