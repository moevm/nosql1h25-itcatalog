import React from 'react';

const GraphPage = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="graph-container">
          <p>Здесь будет отображаться граф связей между профессиями, инструментами и технологиями</p>
          <canvas id="graphCanvas" width="800" height="600"></canvas>
        </div>
      </div>
    </div>
  );
};

export default GraphPage;