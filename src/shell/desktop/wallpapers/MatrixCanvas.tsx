import React, { useEffect, useRef } from 'react';

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンFlowOS';

export const MatrixCanvas: React.FC = () => {
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

    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }).map(() => Math.floor(Math.random() * -50));

    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const render = (time: number) => {
      animRef.current = requestAnimationFrame(render);
      const delta = time - lastTime;
      if (delta < interval) return;
      lastTime = time - (delta % interval);

      // Semi-transparent black background for trailing effect
      ctx.fillStyle = 'rgba(5, 7, 10, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff88';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]!;
        const x = i * fontSize;
        const y = drops[i]! * fontSize;

        // Bright white-green head glyph
        ctx.fillStyle = '#e6fffa';
        ctx.fillText(char, x, y);

        // Next frame turns to standard green
        ctx.fillStyle = '#00f076';

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]! += 1;
      }
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none opacity-85"
    />
  );
};
