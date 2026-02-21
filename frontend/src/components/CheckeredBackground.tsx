import { useEffect, useRef, useState } from 'react';

export default function CheckeredBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const drawBackground = () => {
      // Dark space background with gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 
        canvas.height / 2, 
        0,
        canvas.width / 2, 
        canvas.height / 2, 
        canvas.width / 2
      );
      gradient.addColorStop(0, '#1a1f3a');
      gradient.addColorStop(0.5, '#0f1729');
      gradient.addColorStop(1, '#050a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add stars
      for (let i = 0; i < 200; i++) {
        const x = (i * 123.456) % canvas.width;
        const y = (i * 789.012) % canvas.height;
        const size = Math.random() * 2;
        const opacity = 0.3 + Math.random() * 0.7;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Animated glowing orbs
      const drawGlowingOrb = (x: number, y: number, radius: number, color: string, intensity: number) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.3, `${color}${Math.floor(intensity * 0.6 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.6, `${color}${Math.floor(intensity * 0.3 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${color}00`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      // Multiple glowing orbs with animation
      const orb1X = canvas.width * 0.2 + Math.sin(time * 0.001) * 100;
      const orb1Y = canvas.height * 0.3 + Math.cos(time * 0.0015) * 80;
      drawGlowingOrb(orb1X, orb1Y, 250, '#3b82f6', 0.3 + Math.sin(time * 0.002) * 0.1);

      const orb2X = canvas.width * 0.8 + Math.cos(time * 0.0012) * 120;
      const orb2Y = canvas.height * 0.6 + Math.sin(time * 0.001) * 90;
      drawGlowingOrb(orb2X, orb2Y, 300, '#8b5cf6', 0.25 + Math.cos(time * 0.0018) * 0.1);

      const orb3X = canvas.width * 0.5 + Math.sin(time * 0.0008) * 150;
      const orb3Y = canvas.height * 0.5 + Math.cos(time * 0.001) * 100;
      drawGlowingOrb(orb3X, orb3Y, 200, '#ec4899', 0.2 + Math.sin(time * 0.0015) * 0.08);

      // Mouse glow effect
      if (mousePos.x > 0 && mousePos.y > 0) {
        drawGlowingOrb(mousePos.x, mousePos.y, 150, '#60a5fa', 0.4);
      }

      // Subtle grid overlay
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Animated light rays
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 5; i++) {
        const angle = (time * 0.0005 + i * Math.PI / 2.5) % (Math.PI * 2);
        const length = canvas.width * 0.8;
        const startX = canvas.width / 2;
        const startY = canvas.height / 2;
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      ctx.restore();

      time++;
      animationFrameId = requestAnimationFrame(drawBackground);
    };

    resize();
    drawBackground();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
}
