import { color, rgb, stack } from 'd3';
import React, { use, useEffect, useRef } from 'react';

function interpolateAngles(data, intensity = 30) {
  const interpolated = [];
  const angles = [0, 90, 180, 270, 360];
  const values = [
    data?.top || 0,
    data?.right || 0,
    data?.bottom || 0,
    data?.left || 0,
    data?.top || 0, // wrap for seamless interpolation, avoids NaN
  ];
  // Use intensity parameter to control interpolation density
  for (let angle = 0; angle < 360; angle += intensity) {
    let i = Math.floor(angle / 90);
    let a0 = angles[i], a1 = angles[i + 1];
    let v0 = values[i], v1 = values[i + 1];
    let t = (angle - a0) / (a1 - a0);
    interpolated.push(v0 + t * (v1 - v0));
  }
  return interpolated;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function rgbFromValue(value) {
  // Cyan: (0,255,255), Rouge: (255,0,0)
  // Intermédiaire: dégradé lissé par sigmoïde
  if (value < 40) return rgb(0, 255, 255);
  if (value > 80) return rgb(255, 0, 0);

  // Normalisation entre 40 et 80
  const tRaw = (value - 40) / (80 - 40);
  const t = sigmoid((tRaw - 0.5) * 6); // sigmoïde centrée, plus lisse

  // Interpolation cyan -> rouge
  const r = Math.round(255 * t);
  const g = Math.round(255 * (1 - t));
  const b = Math.round(255 * (1 - t));
  return rgb(r, g, b);
}

function darkenedRgb(rgbColor, factor = 0.9) {
  const r = Math.max(0, Math.floor(rgbColor.r * factor));
  const g = Math.max(0, Math.floor(rgbColor.g * factor));
  const b = Math.max(0, Math.floor(rgbColor.b * factor));
  return rgb(r, g, b);
}

function HeatMapVis({ canvasRef, data }) {
  const stackIndexRef = useRef(0); // remplace state stackIndex
  const colorMatrixRef = useRef(null);

  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!data) return;

    // Interpolation
    const interpolated = interpolateAngles(data, 5);

    const squareSize = canvas.width / interpolated.length;

    const stacksNumber = Math.floor(canvas.height / squareSize)

    // Initialize color matrix if not already done
    colorMatrixRef.current = colorMatrixRef.current || new Array(stacksNumber).fill(null).map(() => new Array(interpolated.length).fill(rgb(0, 0, 0)));

    colorMatrixRef.current[stackIndexRef.current] = interpolated.map
    (
      value =>
        {
          return rgbFromValue(value);
        }
    )

    // Modify all previous stacks to a darkened version if possible
    for (let i = 0; i < stackIndexRef.current; i++) {
      colorMatrixRef.current[i] = colorMatrixRef.current[i].map(
        color => darkenedRgb(color)
      );
    }

    stackIndexRef.current = (stackIndexRef.current + 1) % stacksNumber;

  })


  useEffect(() => {
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas) return;
    
    if (!ctx) return;

    if (colorMatrixRef.current === null) return;

    const squareSize = canvas.width / colorMatrixRef.current[0].length;


    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    for (let i = 0; i < colorMatrixRef.current.length; i++) {
      for (let j = 0; j < colorMatrixRef.current[0].length; j++) {
        ctx.fillStyle = colorMatrixRef.current[i][j].toString();
        ctx.fillRect(j * squareSize, i * squareSize, squareSize, squareSize);
      }
    }

  }, [data])

  return null;
}

export default HeatMapVis;