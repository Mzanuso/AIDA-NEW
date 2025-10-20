import React, { useRef, useEffect } from 'react';

interface ParticleEffectProps {
  count?: number;
  color?: string;
  speed?: number;
  className?: string;
  mouseInteraction?: boolean;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  count = 80,
  color = '#ffffff',
  speed = 1,
  className = '',
  mouseInteraction = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let particlesArray: Particle[] = [];
  let animationFrameId: number;
  let mousePosition = { x: 0, y: 0 };

  class Particle {
    x: number;
    y: number;
    size: number;
    vx: number;
    vy: number;
    alpha: number;
    color: string;

    constructor(canvas: HTMLCanvasElement, color: string) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 5 + 1;
      this.vx = (Math.random() - 0.5) * speed;
      this.vy = (Math.random() - 0.5) * speed;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.color = color;
    }

    update(canvas: HTMLCanvasElement, mouseX: number, mouseY: number, hasMouseInteraction: boolean) {
      this.x += this.vx;
      this.y += this.vy;

      // Interazione con il mouse (attrazione leggera)
      if (hasMouseInteraction && 
          mouseX && mouseY && 
          Math.abs(mouseX - this.x) < 100 && 
          Math.abs(mouseY - this.y) < 100) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (100 - distance) / 100;
        
        this.vx += forceDirectionX * force * 0.2;
        this.vy += forceDirectionY * force * 0.2;
      }

      // Limitazione velocità
      if (Math.abs(this.vx) > 1.5) this.vx = this.vx > 0 ? 1.5 : -1.5;
      if (Math.abs(this.vy) > 1.5) this.vy = this.vy > 0 ? 1.5 : -1.5;

      // Bounce sulle pareti
      if (this.x < 0 || this.x > canvas.width) {
        this.vx = -this.vx;
      }
      if (this.y < 0 || this.y > canvas.height) {
        this.vy = -this.vy;
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  function drawLine(ctx: CanvasRenderingContext2D, p1: Particle, p2: Particle, distance: number) {
    const alpha = 1 - (distance / 150);
    if (alpha > 0) {
      ctx.beginPath();
      ctx.strokeStyle = p1.color;
      ctx.globalAlpha = alpha * 0.5;
      ctx.lineWidth = 0.5;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  function animate(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update(canvas, mousePosition.x, mousePosition.y, mouseInteraction);
      particlesArray[i].draw(ctx);
    }

    // Connect nearby particles with lines
    for (let i = 0; i < particlesArray.length; i++) {
      for (let j = i + 1; j < particlesArray.length; j++) {
        const dx = particlesArray[i].x - particlesArray[j].x;
        const dy = particlesArray[i].y - particlesArray[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          drawLine(ctx, particlesArray[i], particlesArray[j], distance);
        }
      }
    }

    animationFrameId = requestAnimationFrame(() => animate(canvas, ctx));
  }

  function initCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Imposta dimensioni del canvas per riempire il container
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === canvas.parentElement) {
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
          
          // Ricrea le particelle quando il canvas viene ridimensionato
          const ctx = canvas.getContext('2d');
          if (ctx) {
            particlesArray = [];
            for (let i = 0; i < count; i++) {
              particlesArray.push(new Particle(canvas, color));
            }
          }
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
      
      // Imposta dimensioni iniziali
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }

    // Inizializza le particelle
    const ctx = canvas.getContext('2d');
    if (ctx) {
      for (let i = 0; i < count; i++) {
        particlesArray.push(new Particle(canvas, color));
      }
      animate(canvas, ctx);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }

  // Mouse move event handler
  function handleMouseMove(e: MouseEvent) {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  useEffect(() => {
    const cleanup = initCanvas();
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [count, color, speed, mouseInteraction]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-0 ${className}`}
    />
  );
};

export default ParticleEffect;