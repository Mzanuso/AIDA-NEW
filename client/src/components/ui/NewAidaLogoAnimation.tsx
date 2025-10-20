import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Colors
const BLUE_COLOR = '#0092E3';
const MAGENTA_COLOR = '#DD39B0';

interface NewAidaLogoAnimationProps {
  size?: number;
  width?: number;
  height?: number;
  className?: string;
}

const NewAidaLogoAnimation: React.FC<NewAidaLogoAnimationProps> = ({ 
  size = 200, // Ridotto di un terzo rispetto all'originale (300)
  width,
  height,
  className = ''
}) => {
  // Animation state for the wavy inner ring
  const requestRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // SVG dimensions - adjusted to prevent cutting
  const margin = size * 0.02;
  const centerX = size / 2;
  const centerY = size / 2 + margin;

  // Slightly smaller to prevent cutting
  const outerRadiusX = size * 0.43;
  const outerRadiusYTop = size * 0.46;
  const outerRadiusYBottom = size * 0.5;
  const innerRadiusX = size * 0.3;
  const innerRadiusYTop = size * 0.32;
  const innerRadiusYBottom = size * 0.36;
  const circleRadius = size * 0.12;

  // Position the circle lower (by its radius)
  const circleY = centerY + circleRadius;

  // Animation paths
  const outerPath = useRef('');
  const innerPath = useRef('');
  const [displayPaths, setDisplayPaths] = useState({ outer: '', inner: '' });

  // Generate the egg-shaped paths
  useEffect(() => {
    // Generate stable outer egg-shape
    const generateOuter = () => {
      const points = 100;
      const angleStep = (Math.PI * 2) / points;
      let path = '';

      for (let i = 0; i <= points; i++) {
        const angle = i * angleStep;

        // Egg shape calculation - taller at bottom
        const radiusY = angle < Math.PI ? outerRadiusYTop : outerRadiusYBottom;

        const x = centerX + Math.cos(angle) * outerRadiusX;
        const y = centerY + Math.sin(angle) * radiusY;

        if (i === 0) path += `M ${x} ${y}`;
        else path += ` L ${x} ${y}`;
      }
      path += ' Z';
      outerPath.current = path;
    };

    generateOuter();
  }, [centerX, centerY, outerRadiusX, outerRadiusYTop, outerRadiusYBottom]);

  // Animation loop for the wavy inner path
  const animate = (time: number) => {
    if (!timeRef.current) timeRef.current = time;
    const delta = time - timeRef.current;
    const seconds = delta * 0.001;

    // Generate wavy inner path
    const points = 100;
    const angleStep = (Math.PI * 2) / points;
    let path = '';

    for (let i = 0; i <= points; i++) {
      const angle = i * angleStep;

      // Base egg shape
      const radiusY = angle < Math.PI ? innerRadiusYTop : innerRadiusYBottom;

      // Slow wave effect
      const waveAmount = Math.sin(angle * 3 + seconds * 0.5) * (size * 0.02);

      const x = centerX + Math.cos(angle) * (innerRadiusX + waveAmount);
      const y = centerY + Math.sin(angle) * radiusY + waveAmount * 0.5;

      if (i === 0) path += `M ${x} ${y}`;
      else path += ` L ${x} ${y}`;
    }
    path += ' Z';
    innerPath.current = path;

    setDisplayPaths({
      outer: outerPath.current,
      inner: innerPath.current
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  // Start and stop animation loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Subtle squish animation for the magenta circle
  const circleVariants = {
    animate: {
      scaleX: [1, 1.03, 1],
      scaleY: [1, 0.97, 1],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  // Utilizza width e height se forniti, altrimenti usa size
  const finalWidth = width || size;
  const finalHeight = height || size;

  return (
    <div className={className} style={{ width: finalWidth, height: finalHeight }}>
      <svg width={finalWidth} height={finalHeight} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <mask id="ringMask">
            <path d={displayPaths.outer} fill="white" />
            <path d={displayPaths.inner} fill="black" />
          </mask>
        </defs>

        {/* Blue ring */}
        <rect 
          x="0" 
          y="0" 
          width={size} 
          height={size} 
          fill={BLUE_COLOR} 
          mask="url(#ringMask)" 
        />

        {/* Magenta circle with subtle squish animation */}
        <motion.circle
          cx={centerX}
          cy={circleY}
          r={circleRadius}
          fill={MAGENTA_COLOR}
          initial="animate"
          animate="animate"
          variants={circleVariants}
        />
      </svg>
    </div>
  );
};

export default NewAidaLogoAnimation;