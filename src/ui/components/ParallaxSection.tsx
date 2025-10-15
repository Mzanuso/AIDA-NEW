import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  intensity?: number; // Intensità dell'effetto parallax (0-1)
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
  fadeIn?: boolean;
  transitionDelay?: number;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  intensity = 0.2,
  direction = 'up',
  className = '',
  style = {},
  fadeIn = true,
  transitionDelay = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Crea un valore animato fluido basato sullo scroll
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 15,
    stiffness: 100,
    mass: 0.8
  });

  // Definisci il range di movimento in base alla direzione
  let transformRange;
  switch (direction) {
    case 'up':
      transformRange = [100 * intensity, -100 * intensity];
      break;
    case 'down':
      transformRange = [-100 * intensity, 100 * intensity];
      break;
    case 'left':
      transformRange = [100 * intensity, -100 * intensity];
      break;
    case 'right':
      transformRange = [-100 * intensity, 100 * intensity];
      break;
    default:
      transformRange = [100 * intensity, -100 * intensity];
  }

  // Applica la trasformazione in base alla direzione
  const y = direction === 'up' || direction === 'down' 
    ? useTransform(smoothProgress, [0, 1], transformRange)
    : 0;
  
  const x = direction === 'left' || direction === 'right'
    ? useTransform(smoothProgress, [0, 1], transformRange)
    : 0;

  // Opacità per effetto fade-in
  const opacity = fadeIn 
    ? useTransform(smoothProgress, [0, 0.3], [0, 1])
    : 1;

  // Intersection Observer per rilevare quando la sezione è visibile
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
      style={style}
      initial={{ opacity: fadeIn ? 0 : 1 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: transitionDelay }}
    >
      <motion.div
        style={{ 
          y, 
          x, 
          opacity,
          transition: `all ${0.5 + transitionDelay}s cubic-bezier(0.17, 0.55, 0.55, 1)`
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ParallaxSection;