import React, { useEffect, useRef } from 'react';
import { fetchGraph } from '../../services/api';
import * as d3 from 'd3';
import './GraphPage.css';

const GraphPage = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const drawGraph = async () => {
      try {
        const graphData = await fetchGraph();
        const nodes = graphData.nodes;
        const links = graphData.links;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const colorScheme = {      // https://get-color.ru/green/

          'Profession': '#4BC0C0', // Бирюзовый с сильным оттенком аквамарина и тоном голубики
          'Skill': '#3BB08F',      // Зеленые джунгли
          'Technology': '#9ACD32', // Жёлто-зеленый
          'Tool': '#FFCE56',       // Жёлтый

          'Category': '#36A2EB',   // Синий
          'SkillGroup': '#006633', // Зеленый Мичиганского университета
          'TechnologyGroup': '#7CFC00',  // Зеленая лужайка
          'ToolGroup': '#ffa500',  // Оранжевый

          'Default': '#808080'     // Серый
        };

        const wrapText = (text, maxWidth, maxLines = 4) => {
          const words = text.split(' ');
          const lines = [];
          let currentLine = words[0];

          for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = context.measureText(testLine);
            if (metrics.width < maxWidth) {
              currentLine = testLine;
            } else {
              if (lines.length >= maxLines - 1) {
                const ellipsisLine = currentLine + '...';
                const ellipsisWidth = context.measureText(ellipsisLine).width;
                
                if (ellipsisWidth < maxWidth) {
                  lines.push(ellipsisLine);
                } else {
                  while (currentLine.length > 0) {
                    currentLine = currentLine.slice(0, -1);
                    const testEllipsis = currentLine + '...';
                    if (context.measureText(testEllipsis).width < maxWidth) {
                      lines.push(testEllipsis);
                      break;
                    }
                  }
                }
                return lines;
              }
              lines.push(currentLine);
              currentLine = words[i];
            }
          }
          
          if (lines.length < maxLines) {
            lines.push(currentLine);
          }
          return lines;
        };

        const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id).distance(100))
          .force("charge", d3.forceManyBody().strength(-300))
          .force("collision", d3.forceCollide().radius(d => d.label.endsWith('Group') ? 100 : 50))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .on('tick', () => {
            context.save();
            context.clearRect(0, 0, width, height);
            drawGraphElements();
            context.restore();
          });

        const zoom = d3.zoom()
          .scaleExtent([0.1, 10])
          .on('zoom', (event) => {
            const { transform } = event;
            context.save();
            context.clearRect(0, 0, width, height);
            context.translate(transform.x, transform.y);
            context.scale(transform.k, transform.k);
            drawGraphElements();
            context.restore();
          });

        d3.select(canvas)
          .call(zoom)
          .call(zoom.transform, d3.zoomIdentity);

        function drawGraphElements() {

          context.beginPath();
          links.forEach(link => {
            context.moveTo(link.source.x, link.source.y);
            context.lineTo(link.target.x, link.target.y);
          });
          context.strokeStyle = 'rgba(150, 150, 150, 0.5)';
          context.stroke();
          
          nodes.forEach(node => {
            const radius = node.label.endsWith('Group') ? 20 : 10;
            
            context.beginPath();
            context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            context.fillStyle = colorScheme[node.label] || colorScheme['Default'];
            context.fill();
            
            context.lineWidth = 2;
            context.strokeStyle = 'white';
            context.stroke();
            
            if (node.properties?.name) {
              context.font = '10px Arial';
              context.fillStyle = '#333';
              context.textAlign = 'center';
              
              const maxWidth = radius * 5;
              const lines = wrapText(node.properties.name, maxWidth, 4);
              
              lines.forEach((line, i) => {
                context.fillText(
                  line, 
                  node.x, 
                  node.y + radius + 5 + (i * 15)
                );
              });
            }
          });

        }

      } catch (error) {
        console.error('Error drawing graph:', error);
      }
    };

    drawGraph();

    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="graph-container">
          <div className="graph-frame"> 
            <canvas 
              ref={canvasRef}
              id="graphCanvas" 
              width={1500} 
              height={800}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphPage;
