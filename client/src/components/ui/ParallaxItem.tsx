import React, { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxItemProps {
  children: ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

/**
 * Componente per creare effetti di parallasse su singoli elementi
 * Ispirato dal design di lumalabs.ai
 */
const ParallaxItem: React.FC<ParallaxItemProps> = ({
  children,
  speed = 0.2,
  direction = 'up',
  className = ''
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect sullo scroll
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });

  // Calcola la direzione e l'intensità del movimento
  const getTransformValues = () => {
    const baseValue = 100 * speed;
    
    switch (direction) {
      case 'up':
        return [baseValue, 0, -baseValue];
      case 'down':
        return [-baseValue, 0, baseValue];
      case 'left':
        return [baseValue, 0, -baseValue];
      case 'right':
        return [-baseValue, 0, baseValue];
      default:
        return [baseValue, 0, -baseValue];
    }
  };

  // Trasformazioni basate sulla direzione
  const transform = direction === 'up' || direction === 'down'
    ? useTransform(scrollYProgress, [0, 0.5, 1], getTransformValues())
    : undefined;
  
  const transformX = (direction === 'left' || direction === 'right')
    ? useTransform(scrollYProgress, [0, 0.5, 1], getTransformValues())
    : undefined;

  return (
    <motion.div
      ref={itemRef}
      className={className}
      style={{ 
        y: transform,
        x: transformX,
        willChange: 'transform' // Ottimizzazione performance
      }}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxItem;