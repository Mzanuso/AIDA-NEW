import React, { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface FullPageSectionProps {
  children: ReactNode;
  bgColor?: string; 
  startColor?: string;
  endColor?: string;
  index?: number;
  className?: string;
}

/**
 * Componente per sezioni a pagina intera con transizioni fluide
 * Ispirato dal design di lumalabs.ai
 */
const FullPageSection: React.FC<FullPageSectionProps> = ({
  children,
  bgColor = '#121212',
  startColor,
  endColor,
  index = 0,
  className = ''
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Parallax e fade effetti basati sullo scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Valori di trasformazione in base allo scroll
  const y = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    [100, 0, -100]
  );
  
  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [0, 1, 1, 0]
  );

  // Gradiente di sfondo per sfumature fluide
  const gradientStyle = {
    background: startColor && endColor 
      ? `linear-gradient(to bottom, ${startColor}, ${bgColor} 50%, ${endColor})`
      : bgColor,
  };

  // Utilizzando le tecniche di lumalabs.ai per transizioni fluide
  return (
    <motion.section
      ref={sectionRef}
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      style={{
        zIndex: 10 + index,
      }}
    >
      {/* Sfondo con sfumatura graduale */}
      <div 
        className="absolute inset-0 z-0" 
        style={gradientStyle}
      />
      
      {/* Contenitore per il contenuto con effetto parallax */}
      <motion.div 
        className="relative z-10 min-h-screen w-full flex items-center justify-center"
        style={{ 
          y,
          opacity
        }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
};

export default FullPageSection;