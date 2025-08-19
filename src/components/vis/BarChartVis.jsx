import React, { useEffect, useRef, useState } from 'react';
import {Chart, registerables} from 'chart.js/auto';

const interval = 2000;
const green = '#74d53b', yellow = '#e1d42c', orange = '#f1a327', red = '#e36828';

function interpolateAngles(valuesMap) {
  const interpolated = [];
  const angles = [0, 90, 180, 270, 360];
  const values = [
    valuesMap[0], valuesMap[90],
    valuesMap[180], valuesMap[270],
    valuesMap[0]
  ];
  for (let angle = 0; angle < 360; angle += 30) {
    let i = Math.floor(angle / 90);
    let a0 = angles[i], a1 = angles[i + 1];
    let v0 = values[i], v1 = values[i + 1];
    let t = (angle - a0) / (a1 - a0);
    interpolated.push(v0 + t * (v1 - v0));
  }
  return interpolated;
}

function updatedColors(values) {
  return values.map(v => v < 50 ? green : v < 60 ? yellow : v < 90 ? orange : red);
}

Chart.register(...registerables);

function BarChartVis({ canvasRef, data }) {
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 12 }, (_, i) => `${i * 30}°`),
        datasets: [{
          label: 'Noise level (dB)',
          data: new Array(12).fill(0),
          backgroundColor: new Array(12).fill(green),
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        animation: { duration: interval, easing: 'easeInOutQuart' },
        scales: {
          x: { ticks: { display: false }, grid: { display: false }, border: { display: false } },
          y: { min: 0, max: 120, ticks: { display: false }, grid: { display: false }, border: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
    setChart(chartInstance);

    return () => {
      chartInstance.destroy();
    };
  }, [canvasRef]);

  useEffect(() => {
    if (!chart || !data) return;
    const valuesMap = {
      0: data.top,
      90: data.right,
      180: data.bottom,
      270: data.left
    };
    const interpolated = interpolateAngles(valuesMap);
    chart.data.datasets[0].data = interpolated;
    chart.data.datasets[0].backgroundColor = updatedColors(interpolated);
    chart.update();
  }, [chart, data]);

  return null;
}

export default BarChartVis;