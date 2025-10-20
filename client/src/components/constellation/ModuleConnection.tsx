import React from 'react';
import { motion } from 'framer-motion';

// Define connection type
export type ConnectionStatus = 'default' | 'active' | 'critical' | 'blocked';

interface ModuleConnectionProps {
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  status: ConnectionStatus;
  animationSpeed?: number;
}

const ModuleConnection: React.FC<ModuleConnectionProps> = ({
  sourcePosition,
  targetPosition,
  status = 'default',
  animationSpeed = 0.5
}) => {
  // Calculate path for curved line
  const generatePath = (): string => {
    const dx = targetPosition.x - sourcePosition.x;
    const dy = targetPosition.y - sourcePosition.y;
    const curveIntensity = Math.min(Math.abs(dx) * 0.5, 100); // Control curve intensity
    
    // Generate a curved path using cubic bezier
    return `M${sourcePosition.x},${sourcePosition.y} 
            C${sourcePosition.x + curveIntensity},${sourcePosition.y} 
            ${targetPosition.x - curveIntensity},${targetPosition.y} 
            ${targetPosition.x},${targetPosition.y}`;
  };

  // Get stroke color based on status
  const getStrokeColor = (): string => {
    switch (status) {
      case 'active':
        return '#0284c7'; // Blue
      case 'critical':
        return '#f97316'; // Orange
      case 'blocked':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  // Get stroke width based on status
  const getStrokeWidth = (): number => {
    switch (status) {
      case 'active':
      case 'critical':
        return 3;
      case 'blocked':
        return 3;
      default:
        return 2;
    }
  };

  // Animations for different connection types
  const pathVariants = {
    initial: {
      pathLength: 0,
      opacity: 0
    },
    animate: {
      pathLength: 1,
      opacity: status === 'default' ? 0.6 : 1,
      transition: {
        pathLength: { duration: animationSpeed, ease: [0.42, 0, 0.58, 1] },
        opacity: { duration: animationSpeed / 2, ease: [0.42, 0, 1, 1] }
      }
    }
  };

  // Additional animation for active or critical paths
  const flowVariants = {
    initial: {
      pathLength: 0.1,
      pathOffset: 0,
      opacity: 0
    },
    animate: {
      pathLength: 0.15,
      pathOffset: 1,
      opacity: 0.8,
      transition: {
        pathOffset: {
          duration: animationSpeed * 3,
          ease: [0, 0, 1, 1],
          repeat: Infinity
        },
        opacity: { duration: animationSpeed / 2 }
      }
    }
  };

  // Dashed line for blocked connections
  const dashArray = status === 'blocked' ? "6 3" : "none";

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      {/* Base connection path */}
      <motion.path
        d={generatePath()}
        stroke={getStrokeColor()}
        strokeWidth={getStrokeWidth()}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        fill="none"
        initial="initial"
        animate="animate"
        variants={pathVariants}
      />
      
      {/* Animated flow effect for active/critical paths */}
      {(status === 'active' || status === 'critical') && (
        <motion.path
          d={generatePath()}
          stroke="white"
          strokeWidth={getStrokeWidth() + 1}
          strokeLinecap="round"
          fill="none"
          initial="initial"
          animate="animate"
          variants={flowVariants}
        />
      )}
    </svg>
  );
};

export default ModuleConnection;