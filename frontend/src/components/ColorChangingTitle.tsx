import { useState, useEffect } from 'react';

interface ColorChangingTitleProps {
  text: string;
  className?: string;
}

export default function ColorChangingTitle({ text, className = '' }: ColorChangingTitleProps) {
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const width = window.innerWidth;
      const height = window.innerHeight;

      const r = Math.floor((x / width) * 255);
      const g = Math.floor((y / height) * 255);
      const b = Math.floor(((x + y) / (width + height)) * 255);

      setColor(`rgb(${r}, ${g}, ${b})`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <h1
      className={className}
      style={{
        color,
        transition: 'color 0.1s ease',
      }}
    >
      {text}
    </h1>
  );
}
