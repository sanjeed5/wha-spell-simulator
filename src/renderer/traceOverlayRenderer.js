function traceStrokePath(ctx, stroke, width, height) {
  const first = stroke[0];
  ctx.beginPath();
  ctx.moveTo(first.x * width, first.y * height);
  for (let index = 1; index < stroke.length; index += 1) {
    const point = stroke[index];
    ctx.lineTo(point.x * width, point.y * height);
  }
}

export function drawTraceOverlay(ctx, sampleSpell, width, height) {
  const strokes = sampleSpell?.strokes;
  if (!strokes?.length) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = "rgba(42, 121, 135, 0.24)";
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([8, 12]);

  for (const stroke of strokes) {
    if (!Array.isArray(stroke) || stroke.length < 2) {
      continue;
    }
    traceStrokePath(ctx, stroke, width, height);
    ctx.stroke();
  }

  ctx.restore();
}
