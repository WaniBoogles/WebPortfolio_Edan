(function () {
  'use strict';

  // Clean Organized IT Trace Lines Background (steps/moves smoothly every 3 seconds)
  const canvas = document.getElementById('itLinesCanvas');
  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let traces = [];

  const buildTraces = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const rows = Math.max(6, Math.floor(canvas.height / 110));
    traces = [];
    for (let i = 0; i < rows; i++) {
      const y = 70 + i * 110;
      const bendX = Math.floor((0.2 + ((i * 37) % 60) / 100) * canvas.width);
      const drop = i % 2 === 0 ? 22 : -22;
      traces.push({
        y,
        bendX,
        drop,
        phase: (i * 0.25) % 1
      });
    }
  };

  let lastStep = performance.now();
  let stepProgress = 0;

  const drawTraces = (now) => {
    const elapsed = now - lastStep;
    if (elapsed >= 3000) {
      lastStep = now;
      traces.forEach((t) => {
        t.phase = (t.phase + 0.34) % 1;
      });
    }
    stepProgress = Math.min(1, (now - lastStep) / 900);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    traces.forEach((t, idx) => {
      // Subtle static circuit guide line
      ctx.beginPath();
      ctx.moveTo(0, t.y);
      ctx.lineTo(t.bendX, t.y);
      ctx.lineTo(t.bendX + 24, t.y + t.drop);
      ctx.lineTo(canvas.width, t.y + t.drop);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Clean moving data packet segment along the organized track
      const segLen = 95;
      const travel = (t.phase + stepProgress * 0.34) % 1;
      const px = travel * (canvas.width + segLen) - segLen;
      const py = px > t.bendX + 24 ? t.y + t.drop : t.y;

      const grad = ctx.createLinearGradient(px, py, px + segLen, py);
      grad.addColorStop(0, 'rgba(168, 85, 247, 0)');
      grad.addColorStop(0.5, 'rgba(192, 132, 252, 0.32)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + segLen, py);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Crisp node dot at bend
      ctx.beginPath();
      ctx.arc(t.bendX, t.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(192, 132, 252, 0.18)';
      ctx.fill();
    });

    requestAnimationFrame(drawTraces);
  };

  buildTraces();
  window.addEventListener('resize', buildTraces);
  requestAnimationFrame(drawTraces);
})();
