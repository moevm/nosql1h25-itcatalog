import React, { useEffect } from 'react';
import { fetchGraph } from './api';

const GraphPage = () => {
  useEffect(() => {
    const drawGraph = async () => {
      try {
        const graphData = await fetchGraph();
        
        const nodes = graphData.nodes;
        const links = graphData.links;

        const canvas = document.getElementById('graphCanvas');
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink().id(d => d.id).distance(100))
          .force("charge", d3.forceManyBody().strength(-300))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .on("tick", ticked);

        function ticked() {
          context.clearRect(0, 0, width, height);
            
          context.beginPath();
          links.forEach(link => {
            context.moveTo(link.source.x, link.source.y);
            context.lineTo(link.target.x, link.target.y);
          });
          context.strokeStyle = '#999';
          context.stroke();
          
          nodes.forEach(d => {
            context.beginPath();
            context.arc(d.x, d.y, 5, 0, 2 * Math.PI);
            context.fillStyle = '#69b3a2';
            context.fill();
            context.stroke();
          });
        }

        simulation.force("link").links(links);
      } catch (error) {
        console.error('Error drawing graph:', error);
      }
    };

    drawGraph();
  }, []);

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
