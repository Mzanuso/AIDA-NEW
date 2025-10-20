import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

interface SectionTransitionProps {
  children: React.ReactNode;
  direction?: 'bottom' | 'top' | 'left' | 'right';
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  tag?: keyof JSX.IntrinsicElements;
}

const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  direction = 'bottom',
  className = '',
  delay = 0,
  duration = 0.7,
  threshold = 0.15,
  tag: Tag = 'div'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  // Direzioni iniziali per l'animazione
  const directionVariants = {
    hidden: {
      x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
      y: direction === 'bottom' ? 100 : direction === 'top' ? -100 : 0,
      opacity: 0,
      scale: 0.95
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: duration,
        delay: delay,
        ease: [0.22, 1, 0.36, 1] // Custom easing (cubic-bezier)
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Intersection Observer per rilevare quando la sezione è visibile
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      <AnimatePresence>
        {isInView && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={directionVariants}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente per il cambiamento "reveal" verticale
export const VerticalReveal: React.FC<{ 
  className?: string, 
  children: React.ReactNode,
  delay?: number,
  direction?: 'up' | 'down'
}> = ({ className = '', children, delay = 0, direction = 'up' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Trasformazione basata sullo scroll
  const clipPathProgress = useTransform(
    scrollYProgress, 
    [0, 0.5], 
    direction === 'up'
      ? ['polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)']
      : ['polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)']
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        style={{ 
          clipPath: clipPathProgress,
          transition: `all ${0.6 + delay}s cubic-bezier(0.16, 1, 0.3, 1)`
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SectionTransition;