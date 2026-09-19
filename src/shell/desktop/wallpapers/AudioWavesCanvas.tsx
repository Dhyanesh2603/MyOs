import React, { useEffect, useRef } from 'react';

export const AudioWavesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let phase = 0;

    const render = () => {
      phase += 0.015;

      ctx.fillStyle = '#06080d';
      ctx.fillRect(0, 0, width, height);

      const layers = [
        { color: 'rgba(0, 240, 255, 0.25)', speed: 1, freq: 0.003, amp: 40, offset: 0 },
        { color: 'rgba(168, 85, 247, 0.22)', speed: 1.3, freq: 0.004, amp: 55, offset: 2 },
        { color: 'rgba(59, 130, 246, 0.28)', speed: 0.8, freq: 0.0025, amp: 50, offset: 4 },
      ];

      layers.forEach((l) => {
        ctx.beginPath();
        const baseLine = height * 0.65;
        ctx.moveTo(0, baseLine);

        for (let x = 0; x <= width; x += 10) {
          const y =
            baseLine +
            Math.sin(x * l.freq + phase * l.speed + l.offset) * l.amp +
            Math.cos(x * 0.001 + phase * 0.5) * 20;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        ctx.fillStyle = l.color;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
};
