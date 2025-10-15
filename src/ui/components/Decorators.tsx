import React from 'react';
import { motion } from 'framer-motion';

type WaveProps = {
  className?: string;
  fill?: string;
  animate?: boolean;
  height?: number;
  width?: number;
  translateY?: number;
};

export const WavePattern: React.FC<WaveProps> = ({ 
  className, 
  fill = "url(#gradient-blue-magenta)", 
  animate = true,
  height = 200,
  width = 1000,
  translateY = 0
}) => {
  return (
    <svg 
      viewBox="0 0 1000 200" 
      className={className}
      style={{ height, width }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="gradient-blue-magenta" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0092E3" />
          <stop offset="100%" stopColor="#DD39B0" />
        </linearGradient>
        <linearGradient id="gradient-blue-dark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0092E3" />
          <stop offset="100%" stopColor="#121212" />
        </linearGradient>
        <linearGradient id="gradient-magenta-dark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#DD39B0" />
          <stop offset="100%" stopColor="#121212" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,160 C150,100 350,240 500,140 C650,40 850,180 1000,120 L1000,200 L0,200 Z"
        fill={fill}
        initial={animate ? { translateY } : undefined}
        animate={animate ? { 
          translateY: [translateY, translateY - 10, translateY],
        } : undefined}
        transition={animate ? { 
          duration: 5, 
          repeat: Infinity,
          repeatType: "reverse", 
          ease: "easeInOut" 
        } : undefined}
      />
    </svg>
  );
};

type CircleGridProps = {
  className?: string;
  itemCount?: number;
  size?: number;
  animate?: boolean;
};

export const CircleGrid: React.FC<CircleGridProps> = ({ 
  className, 
  itemCount = 20,
  size = 10,
  animate = true
}) => {
  return (
    <div className={`relative ${className}`}>
      {[...Array(itemCount)].map((_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 3 + Math.random() * 7;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-aida-blue/30"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
            }}
            initial={animate ? { opacity: 0, scale: 0 } : undefined}
            animate={animate ? { 
              opacity: [0, 0.7, 0],
              scale: [0, 1, 1.5, 0],
            } : undefined}
            transition={animate ? { 
              duration, 
              delay,
              repeat: Infinity,
              repeatType: "loop"
            } : undefined}
          />
        );
      })}
    </div>
  );
};

type GradientBlobProps = {
  className?: string;
  colors?: string[];
  animate?: boolean;
};

export const GradientBlob: React.FC<GradientBlobProps> = ({
  className,
  colors = ["#0092E3", "#DD39B0"],
  animate = true
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute rounded-[40%] blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle at center, ${colors[0]}, ${colors[1]})`,
          width: '60%',
          height: '60%',
          top: '20%',
          left: '20%',
        }}
        initial={animate ? { rotate: 0, scale: 1 } : undefined}
        animate={animate ? { 
          rotate: 360,
          scale: [1, 1.2, 1],
        } : undefined}
        transition={animate ? { 
          duration: 20, 
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear"
        } : undefined}
      />
    </div>
  );
};

type GridPatternProps = {
  className?: string;
  size?: number;
  gap?: number;
  thickness?: number;
  opacity?: number;
  animate?: boolean;
};

export const GridPattern: React.FC<GridPatternProps> = ({
  className,
  size = 50,
  gap = 2,
  thickness = 1,
  opacity = 0.2,
  animate = true
}) => {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,${thickness/10}) ${thickness}px, transparent ${thickness}px),
            linear-gradient(to bottom, rgba(255,255,255,${thickness/10}) ${thickness}px, transparent ${thickness}px)
          `,
          backgroundSize: `${size}px ${size}px`,
          backgroundPosition: `${gap}px ${gap}px`,
        }}
        initial={animate ? { opacity } : undefined}
        animate={animate ? { 
          opacity: [opacity, opacity * 0.75, opacity],
          backgroundPosition: [`${gap}px ${gap}px`, `${gap + 10}px ${gap + 10}px`, `${gap}px ${gap}px`]
        } : undefined}
        transition={animate ? { 
          duration: 15, 
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear"
        } : undefined}
      />
    </div>
  );
};

type FloatingParticlesProps = {
  className?: string;
  particleCount?: number;
  minSize?: number;
  maxSize?: number;
  animate?: boolean;
};

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  className,
  particleCount = 30,
  minSize = 2,
  maxSize = 6,
  animate = true
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {[...Array(particleCount)].map((_, i) => {
        const size = minSize + Math.random() * (maxSize - minSize);
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 10 + Math.random() * 20;
        
        // Randomly choose between blue, magenta and white
        const colors = ["#0092E3", "#DD39B0", "#FFFFFF"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: color,
              width: size,
              height: size,
              left: `${x}%`,
              top: `${y}%`,
              opacity: 0.3,
            }}
            initial={animate ? { 
              y: y + 100,
              opacity: 0 
            } : undefined}
            animate={animate ? { 
              y: [y + 20, y - 20, y + 20],
              opacity: [0.1, 0.4, 0.1],
              x: [x - 10, x + 10, x - 10],
            } : undefined}
            transition={animate ? { 
              duration,
              delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            } : undefined}
          />
        );
      })}
    </div>
  );
};

type AnimatedBackgroundProps = {
  className?: string;
};

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-aida-dark via-aida-dark to-aida-dark">
        {/* Sfumature di colore con gradients fluidi */}
        <div className="absolute inset-0 z-0 opacity-30 overflow-hidden">
          {/* Sfumatura blu in alto a destra */}
          <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[50%] rounded-full bg-aida-blue/40 blur-[120px] transform rotate-15"></div>
          
          {/* Sfumatura magenta in basso a sinistra */}
          <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[50%] rounded-full bg-aida-magenta/30 blur-[120px] transform -rotate-15"></div>
          
          {/* Sfumatura mista al centro */}
          <div className="absolute top-[30%] left-[20%] w-[60%] h-[40%] rounded-full bg-gradient-to-br from-aida-blue/20 to-aida-magenta/20 blur-[100px]"></div>
        </div>
        
        {/* Pattern sottile nell'intero sfondo */}
        <GridPattern 
          className="absolute inset-0 opacity-[0.07]" 
          size={80} 
          thickness={0.4} 
        />
        
        {/* Particelle fluttuanti nello sfondo */}
        <FloatingParticles 
          className="absolute inset-0" 
          particleCount={window.innerWidth < 768 ? 20 : 40}
          minSize={1}
          maxSize={4}
        />
      </div>
    </div>
  );
};