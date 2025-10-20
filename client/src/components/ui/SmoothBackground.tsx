import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GridPattern, FloatingParticles } from './Decorators';

interface SmoothBackgroundProps {
  colorTop?: string;
  colorBottom?: string;
  withGrid?: boolean;
  withParticles?: boolean;
  opacity?: number;
  zIndex?: number;
}

/**
 * Componente per creare sfondi con transizioni fluide
 * Ispirato dal design di lumalabs.ai
 */
const SmoothBackground: React.FC<SmoothBackgroundProps> = ({
  colorTop = 'rgba(0, 146, 227, 0.2)',
  colorBottom = 'rgba(221, 57, 176, 0.2)',
  withGrid = true,
  withParticles = true,
  opacity = 0.8,
  zIndex = 0
}) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  // Effetto parallasse allo scroll
  const { scrollYProgress } = useScroll({
    target: backgroundRef,
    offset: ["start end", "end start"]
  });

  // Trasformazioni basate sullo scroll per effetto parallasse
  const yTop = useTransform(
    scrollYProgress, 
    [0, 1], 
    ['-10%', '-30%']
  );
  
  const yBottom = useTransform(
    scrollYProgress, 
    [0, 1], 
    ['10%', '30%']
  );

  const scale = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    [0.95, 1, 0.95]
  );

  return (
    <div 
      ref={backgroundRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex }}
    >
      {/* Sfondo base con colore scuro */}
      <motion.div className="absolute inset-0 bg-aida-dark opacity-95" />
      
      {/* Sfumatura con blob in alto */}
      <motion.div 
        className="absolute top-0 left-0 right-0 w-full h-[70%] overflow-hidden" 
        style={{ y: yTop }}
      >
        <div 
          className="absolute w-[120%] h-[120%] left-[-10%] top-[-50%] rounded-[40%] blur-[120px]"
          style={{ 
            background: `radial-gradient(circle at center, ${colorTop}, transparent 70%)`,
            opacity: opacity * 0.7
          }}
        />
      </motion.div>
      
      {/* Sfumatura con blob in basso */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 w-full h-[70%] overflow-hidden"
        style={{ y: yBottom }}
      >
        <div 
          className="absolute w-[120%] h-[120%] left-[-10%] bottom-[-50%] rounded-[40%] blur-[120px]"
          style={{ 
            background: `radial-gradient(circle at center, ${colorBottom}, transparent 70%)`,
            opacity: opacity * 0.7
          }}
        />
      </motion.div>
      
      {/* Pattern griglia sottile */}
      {withGrid && (
        <motion.div style={{ scale }} className="absolute inset-0">
          <GridPattern 
            className="absolute inset-0" 
            size={60}
            thickness={0.3}
            opacity={0.07}
          />
        </motion.div>
      )}
      
      {/* Particelle fluttuanti */}
      {withParticles && (
        <FloatingParticles 
          className="absolute inset-0" 
          particleCount={20}
          minSize={1}
          maxSize={3}
        />
      )}
    </div>
  );
};

export default SmoothBackground;