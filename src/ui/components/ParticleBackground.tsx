import React, { useRef, useEffect } from 'react';

interface ParticleBackgroundProps {
  className?: string;
  color1?: string;
  color2?: string;
  particleCount?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  className = '',
  color1 = '#1e90ff',
  color2 = '#ff33cc',
  particleCount: customParticleCount
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      particles.current = [];
      const particleCount = customParticleCount || Math.min(100, Math.floor((canvas.width * canvas.height) / 10000));
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 2 + 1;
        const isFirstColor = Math.random() > 0.4;
        
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: size,
          color: isFirstColor ? color1 : color2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Aggiorna posizione
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bordi wrap-around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      
      // Disegna connessioni
      drawConnections();
      
      animationFrameId.current = requestAnimationFrame(drawParticles);
    };
    
    const drawConnections = () => {
      const connectionDistance = 100;
      
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const dx = particles.current[i].x - particles.current[j].x;
          const dy = particles.current[i].y - particles.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            ctx.beginPath();
            // Usa un colore derivato dai colori principali per le connessioni
            const r = Math.round((parseInt(color1.slice(1, 3), 16) + parseInt(color2.slice(1, 3), 16)) / 2);
            const g = Math.round((parseInt(color1.slice(3, 5), 16) + parseInt(color2.slice(3, 5), 16)) / 2);
            const b = Math.round((parseInt(color1.slice(5, 7), 16) + parseInt(color2.slice(5, 7), 16)) / 2);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${1 - distance / connectionDistance})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles.current[i].x, particles.current[i].y);
            ctx.lineTo(particles.current[j].x, particles.current[j].y);
            ctx.stroke();
          }
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleBackground;