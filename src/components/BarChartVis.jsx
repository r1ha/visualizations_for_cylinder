import React, { useEffect, useRef, useState } from 'react';
import {Chart, registerables} from 'chart.js/auto'; // Assure-toi d'avoir installé Chart.js

const interval = 2000;
const green = '#74d53b', yellow = '#e1d42c', orange = '#f1a327', red = '#e36828';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

function BarChartVis({ canvasRef }) {
  const [chart, setChart] = useState(null);
  const [useWebSocket, setUseWebSocket] = useState(false);

  const lastSim = useRef({
    timestamp: Date.now(),
    top: Math.random() * 100,
    right: Math.random() * 100,
    bottom: Math.random() * 100,
    left: Math.random() * 100
  });

  const simDrift = useRef([0, 0, 0, 0]);

  const applyDataToChart = (jsonData) => {
    const directions = ['top', 'right', 'bottom', 'left'];
    let maxKey = directions[0];
    for (let k of directions) {
      if (jsonData[k] > jsonData[maxKey]) maxKey = k;
    }
    for (let k of directions) {
      if (k !== maxKey) jsonData[k] *= 0.1;
    }
    const valuesMap = {
      0: jsonData.top,
      90: jsonData.right,
      180: jsonData.bottom,
      270: jsonData.left
    };
    const interpolated = interpolateAngles(valuesMap);
    chart.data.datasets[0].data = interpolated;
    chart.data.datasets[0].backgroundColor = updatedColors(interpolated);
    chart.update();
  };

  const generateSimulatedData = () => {
    const reset = Math.random();
    let data;
    const general = (Math.random() - 0.5) * 10;
    for (let i = 0; i < 4; i++) {
      simDrift.current[i] = (Math.random() - 0.5) * 7.5;
    }
    if (reset > 0.75) {
      data = {
        timestamp: Date.now(),
        top: Math.random() * 100,
        right: Math.random() * 100,
        bottom: Math.random() * 100,
        left: Math.random() * 100
      };
    } else {
      data = {
        timestamp: Date.now(),
        top: clamp(lastSim.current.top + general + simDrift.current[0], 0, 120),
        right: clamp(lastSim.current.right + general + simDrift.current[1], 0, 120),
        bottom: clamp(lastSim.current.bottom + general + simDrift.current[2], 0, 120),
        left: clamp(lastSim.current.left + general + simDrift.current[3], 0, 120)
      };
    }
    lastSim.current = data;
    return data;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    // Fixe la taille du canvas AVANT d'initialiser Chart.js

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
        responsive: false, // Désactive le mode responsive
        animation: { duration: interval, easing: 'easeInOutQuart' },
        scales: {
          x: { ticks: { display: false }, grid: { display: false }, border: { display: false } },
          y: { min: 0, max: 120, ticks: { display: false }, grid: { display: false }, border: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
    setChart(chartInstance);

    // Cleanup: destroy chart instance on unmount or before re-creating
    return () => {
      chartInstance.destroy();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (chart && !useWebSocket) {
        const simData = generateSimulatedData();
        applyDataToChart(simData);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [chart, useWebSocket]);

  return null;
}

export default BarChartVis;
