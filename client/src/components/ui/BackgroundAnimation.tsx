import React from 'react';
import { motion } from 'framer-motion';

export type BackgroundColor = 
  | 'blue' 
  | 'red' 
  | 'green' 
  | 'purple' 
  | 'orange' 
  | 'teal' 
  | 'indigo' 
  | 'magenta' 
  | 'amber' 
  | 'emerald' 
  | 'violet' 
  | 'cyan'
  | 'hub';

interface BackgroundAnimationProps {
  color: BackgroundColor;
  children?: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
}

// Definizione dei colori per ciascun tipo di sfondo
const getGradientColors = (color: BackgroundColor, intensity: 'low' | 'medium' | 'high' = 'medium') => {
  // Multiplier per l'intensità
  const intensityMap = {
    low: { base: 0.1, mid: 0.03, edge: 0 },
    medium: { base: 0.2, mid: 0.05, edge: 0 },
    high: { base: 0.3, mid: 0.08, edge: 0 }
  };
  
  const { base, mid, edge } = intensityMap[intensity];
  
  switch (color) {
    case 'blue':
      return `radial-gradient(circle, rgba(0,146,227,${base}) 0%, rgba(0,50,100,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'red':
      return `radial-gradient(circle, rgba(239,68,68,${base}) 0%, rgba(136,19,55,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'green':
      return `radial-gradient(circle, rgba(16,185,129,${base}) 0%, rgba(6,78,59,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'purple':
      return `radial-gradient(circle, rgba(139,92,246,${base}) 0%, rgba(76,29,149,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'orange':
      return `radial-gradient(circle, rgba(249,115,22,${base}) 0%, rgba(154,52,18,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'teal':
      return `radial-gradient(circle, rgba(20,184,166,${base}) 0%, rgba(17,94,89,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'indigo':
      return `radial-gradient(circle, rgba(79,70,229,${base}) 0%, rgba(49,46,129,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'magenta':
      return `radial-gradient(circle, rgba(221,57,176,${base}) 0%, rgba(136,19,84,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'amber':
      return `radial-gradient(circle, rgba(251,191,36,${base}) 0%, rgba(180,83,9,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'emerald':
      return `radial-gradient(circle, rgba(16,185,129,${base}) 0%, rgba(4,120,87,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'violet':
      return `radial-gradient(circle, rgba(139,92,246,${base}) 0%, rgba(76,29,149,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'cyan':
      return `radial-gradient(circle, rgba(6,182,212,${base}) 0%, rgba(14,116,144,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    case 'hub':
      return `radial-gradient(circle, rgba(17,24,39,${base}) 0%, rgba(12,12,24,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
    default:
      return `radial-gradient(circle, rgba(0,146,227,${base}) 0%, rgba(0,50,100,${mid}) 40%, rgba(0,0,0,${edge}) 70%)`;
  }
};

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ color, children, intensity = 'medium' }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Sfondo animato con gradazione */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-[150%] h-[150%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: getGradientColors(color, intensity),
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 0.6, 0.8],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 15,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Effetto di sovrapposizione glassmorphism */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-0" />
      
      {/* Contenuto principale */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundAnimation;