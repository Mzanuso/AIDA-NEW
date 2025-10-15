import React from 'react';

export type AppPhase = 'onboarding' | 'hub' | 'style' | 'storytelling' | 'storyboard' | 'video';

interface PhaseIndicatorProps {
  currentPhase: AppPhase;
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ currentPhase }) => {
  const phases: AppPhase[] = ['onboarding', 'hub', 'style', 'storytelling', 'storyboard', 'video'];
  
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-aida-gray/70 backdrop-blur-md rounded-full px-2 py-1">
      <div className="flex items-center space-x-1">
        {phases.map((phase, index) => (
          <React.Fragment key={phase}>
            <div 
              className={`h-2 w-2 rounded-full ${
                phase === currentPhase 
                  ? 'bg-aida-blue' 
                  : phases.indexOf(currentPhase) > index 
                    ? 'bg-aida-white' 
                    : 'bg-aida-gray'
              }`}
            />
            {index < phases.length - 1 && (
              <div className="h-px w-3 bg-aida-gray/50" />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-xs font-medium text-center mt-1 text-aida-white">
        {currentPhase.toUpperCase()}
      </div>
    </div>
  );
};

export default PhaseIndicator;