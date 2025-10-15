import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const BLUE_COLOR = '#0092E3';
const MAGENTA_COLOR = '#DD39B0';

interface AidaLogoAnimationProps {
  size?: number;
  width?: number;
  height?: number;
  className?: string;
}

const AidaLogoAnimation: React.FC<AidaLogoAnimationProps> = ({ 
  size = 200,
  width,
  height,
  className = ''
}) => { // Utilizziamo size come default, ma permettiamo override con width/height
  const [seed, setSeed] = useState(0);
  const circleControls = useAnimation();
  const dropControls = useAnimation();

  // Center coordinates
  const centerX = size / 2;
  const centerY = size / 2;

  // Radius values - egg-shaped like original
  const outerRadiusX = size * 0.45;
  const outerRadiusYTop = size * 0.45;    // Correzione: reso più circolare in alto
  const outerRadiusYBottom = size * 0.52; // Mantenuto leggermente più grande in basso

  const innerRadiusX = size * 0.32;
  const innerRadiusYTop = size * 0.32;    // Correzione: reso più circolare in alto
  const innerRadiusYBottom = size * 0.38; // Mantenuto proporzione originale

  const circleRadius = size * 0.12;

  // Animation state
  type AnimationPhase = 'initial' | 'dropping' | 'impact' | 'final';
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('initial');
  const [ringPath, setRingPath] = useState<string>('');
  const [dropPath, setDropPath] = useState<string>('');
  const [dropColor, setDropColor] = useState<string>(BLUE_COLOR);
  const [circlePath, setCirclePath] = useState<string>('');

  // Generate path for a ring with wavy inner and stable outer
  const generateRing = (time: number) => {
    const points = 100;
    const angleStep = (Math.PI * 2) / points;

    let outer = '';
    let inner = '';

    // Generate outer egg-shaped path (stable, not wavy)
    for (let i = 0; i <= points; i++) {
      const angle = i * angleStep;

      // Egg shape calculation - corretto in alto
      let radiusY = angle < Math.PI 
          ? outerRadiusYTop 
          : outerRadiusYBottom;

      const x = centerX + Math.cos(angle) * outerRadiusX;
      const y = centerY + Math.sin(angle) * radiusY;

      if (i === 0) outer += `M ${x} ${y}`;
      else outer += ` L ${x} ${y}`;
    }
    outer += ' Z';

    // Generate inner wavy path with egg shape base
    for (let i = 0; i <= points; i++) {
      const angle = i * angleStep;

      // Base shape is slightly egg-shaped - corretto in alto
      let radiusY = angle < Math.PI 
          ? innerRadiusYTop 
          : innerRadiusYBottom;

      // Slower and more pronounced wave effect
      let waveInner = Math.sin(angle * 3 + time * 0.5) * (size * 0.02);

      // If we're in the dropping phase, create the droplet effect at the top
      if (animationPhase === 'dropping') {
        // Top area of the ring
        if (angle > Math.PI * 1.7 && angle < Math.PI * 2.3) {
          const dropEffect = Math.sin((angle - Math.PI * 1.7) / (Math.PI * 0.6) * Math.PI);
          waveInner -= dropEffect * (size * 0.15); // More pronounced drop shape
        }
      }

      // If we're in the impact phase, create deformation at the bottom
      if (animationPhase === 'impact') {
        // Bottom area of the ring
        if (angle > Math.PI * 0.7 && angle < Math.PI * 1.3) {
          const impactEffect = Math.sin((angle - Math.PI * 0.7) / (Math.PI * 0.6) * Math.PI);
          waveInner += impactEffect * (size * 0.06); // Stronger impact deformation
        }
      }

      // Calculate radius with wave effect
      const radius = innerRadiusX + waveInner;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radiusY + waveInner;

      if (i === 0) inner += `M ${x} ${y}`;
      else inner += ` L ${x} ${y}`;
    }
    inner += ' Z';

    return { outer, inner };
  };

  // Generate the droplet path
  const generateDroplet = (progress: number, time: number) => {
    if (progress === 0) return '';

    // Top of the ring is our starting point
    const startX = centerX;
    const startY = centerY - innerRadiusYTop;

    // Bottom of inner ring (target position)
    const endY = centerY + innerRadiusYBottom;

    // Calculate how far the drop has fallen
    const totalDistance = endY - startY;
    const currentPosition = startY + (totalDistance * progress);

    // Make the drop stretch based on velocity
    const velocityFactor = Math.sin(progress * Math.PI); // Faster in middle
    const stretchFactor = (1 - progress) * velocityFactor * 0.7;

    const dropHeight = circleRadius * (1 + stretchFactor);
    const dropWidth = circleRadius * (1 - stretchFactor * 0.3);

    // Add some wobble to the drop as it falls
    const wobble = Math.sin(time * 5) * (size * 0.01) * Math.sin(progress * Math.PI);

    // Make drop more teardrop shaped during fall
    const topControlY = progress < 0.3 
      ? currentPosition - dropHeight * 0.5
      : currentPosition - dropHeight * 0.7;

    const bottomControlY = progress < 0.3
      ? currentPosition + dropHeight * 0.5
      : currentPosition + dropHeight * 0.3;

    const dropPath = `
      M ${startX - dropWidth + wobble} ${currentPosition}
      C ${startX - dropWidth + wobble} ${topControlY},
        ${startX + dropWidth + wobble} ${topControlY},
        ${startX + dropWidth + wobble} ${currentPosition}
      C ${startX + dropWidth + wobble} ${bottomControlY},
        ${startX - dropWidth + wobble} ${bottomControlY},
        ${startX - dropWidth + wobble} ${currentPosition}
      Z
    `;

    // Calculate color based on progress - blue to magenta
    const progressColor = interpolateColor(BLUE_COLOR, MAGENTA_COLOR, progress);
    setDropColor(progressColor);

    return dropPath;
  };

  // Helper function to interpolate between two hex colors
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    // Convert hex to RGB
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    // Interpolate RGB values
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Generate the final circle path
  const generateCircle = (squishFactor = 0) => {
    // Circle is at the bottom inner part of the ring
    const cx = centerX;
    const cy = centerY + (innerRadiusYBottom * 0.7); // Position at lower inner part

    // Calculate squish effect
    const scaleX = 1 + squishFactor * 0.4;
    const scaleY = 1 - squishFactor * 0.3;

    // Calculate ellipse points
    const rx = circleRadius * scaleX;
    const ry = circleRadius * scaleY;

    // SVG circle path
    return `
      M ${cx - rx} ${cy}
      A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}
      A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy}
      Z
    `;
  };

  // Run animation frame loop for wave effect
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = (time: number) => {
      const adjustedTime = time * 0.001; // Convert to seconds for smoother animation

      const { outer, inner } = generateRing(adjustedTime);
      setRingPath(`${outer} ${inner}`);

      // Update droplet or circle based on animation phase
      if (animationPhase === 'dropping') {
        // Generate a droplet shape that's falling - slower speed
        const dropProgress = Math.min((adjustedTime - seed) * 0.3, 1);
        setDropPath(generateDroplet(dropProgress, adjustedTime));

        // If drop reaches bottom, switch to impact phase
        if (dropProgress >= 1) {
          setAnimationPhase('impact');
          dropControls.set({ opacity: 0 });
          circleControls.set({ 
            opacity: 1,
            pathLength: 1
          });
          circleControls.start({
            scaleX: [1.3, 1],
            scaleY: [0.7, 1],
            transition: { 
              duration: 0.8, // Slower impact
              ease: "easeOut",
              times: [0, 1]
            }
          });
        }
      } else if (animationPhase === 'impact') {
        // Update the circle with squish effect that gradually reduces
        const impactTime = adjustedTime - seed - 3.3; // Offset after longer drop
        const squishFactor = Math.max(0, Math.cos(impactTime * 4) * Math.exp(-impactTime * 2));
        setCirclePath(generateCircle(squishFactor));

        // After impact animation completes, go to final state
        if (impactTime > 2) {
          setAnimationPhase('final');
        }
      } else if (animationPhase === 'final') {
        // Just keep the circle at rest
        setCirclePath(generateCircle(0));
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationPhase, seed, dropControls, circleControls]);

  // Start animation sequence
  useEffect(() => {
    // Set initial seed for timing reference
    setSeed(prevSeed => prevSeed + 1);

    // Start in wave only state
    setAnimationPhase('initial');

    // After 2 seconds, transition to dropping phase
    const dropTimer = setTimeout(() => {
      setAnimationPhase('dropping');
      dropControls.set({ opacity: 1 });
    }, 2000);

    // Reset animation after completion - longer cycle
    const resetTimer = setTimeout(() => {
      setAnimationPhase('initial');
      dropControls.set({ opacity: 0 });
      circleControls.set({ opacity: 0 });
      setSeed(prevSeed => prevSeed + 1);
    }, 12000);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(resetTimer);
    };
  }, [dropControls, circleControls]); // Rimozione di seed dalla dependency array per evitare loop

  // Utilizza width e height se forniti, altrimenti usa size
  const finalWidth = width || size;
  const finalHeight = height || size;

  return (
    <div className={className} style={{ width: finalWidth, height: finalHeight }}>
      <svg width={finalWidth} height={finalHeight} viewBox={`0 0 ${size} ${size}`}>
        {/* The blue wavy ring */}
        <path
          d={ringPath}
          fill={BLUE_COLOR}
          fillRule="evenodd"
        />

        {/* The droplet while falling - color transitions from blue to magenta */}
        <motion.path
          d={dropPath}
          fill={dropColor}
          initial={{ opacity: 0 }}
          animate={dropControls}
        />

        {/* The magenta circle after falling */}
        <motion.path
          d={circlePath}
          fill={MAGENTA_COLOR}
          initial={{ opacity: 0 }}
          animate={circleControls}
        />
      </svg>
    </div>
  );
};

export default AidaLogoAnimation;