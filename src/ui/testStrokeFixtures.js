import { degreesToRadians } from "../utils/geometry.js";

function arcStroke(id, centerX, centerY, radius, startDeg, endDeg, steps) {
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const deg = startDeg + (endDeg - startDeg) * (index / steps);
    const radians = degreesToRadians(deg);
    points.push({
      x: centerX + Math.cos(radians) * radius,
      y: centerY + Math.sin(radians) * radius,
      pressure: 0.5,
      t: performance.now() + index
    });
  }
  return { id, points };
}

function scaledSampleStrokes(sampleSpell, width, height, startIndex = 0, endIndex) {
  const slice = sampleSpell.strokes.slice(startIndex, endIndex);
  return slice
    .filter((stroke) => Array.isArray(stroke) && stroke.length >= 2)
    .map((stroke, index) => ({
      id: `sample-${startIndex + index}`,
      points: stroke.map((point, pointIndex) => ({
        x: point.x * width,
        y: point.y * height,
        pressure: 0.5,
        t: performance.now() + pointIndex
      }))
    }));
}

export function buildCastDemoStrokes({ sampleSpell, width, height }) {
  const centerX = width * 0.5;
  const centerY = height * 0.49;
  const radius = Math.min(width, height) * 0.46;
  return [
    arcStroke("ring-open", centerX, centerY, radius, 25, 335, 120),
    arcStroke("ring-close", centerX, centerY, radius, 335, 385, 30),
    ...scaledSampleStrokes(sampleSpell, width, height, 10, 20)
  ];
}

export function buildFizzleDemoStrokes({ width, height }) {
  const centerX = width * 0.5;
  const centerY = height * 0.49;
  const radius = Math.min(width, height) * 0.46;
  return [
    arcStroke("ring-open", centerX, centerY, radius, 25, 335, 120),
    arcStroke("ring-close", centerX, centerY, radius, 335, 385, 30)
  ];
}
