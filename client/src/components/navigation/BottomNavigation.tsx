import React from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setCurrentPhase, PhaseType } from '@/lib/redux/slices/navigationSlice';

type NavItem = {
  phase: PhaseType;
  icon: string;
  label: string;
};

const navItems: NavItem[] = [
  { phase: 'STYLE', icon: 'palette', label: 'STYLE' },
  { phase: 'STORY', icon: 'text_fields', label: 'STORY' },
  { phase: 'BOARD', icon: 'grid_view', label: 'BOARD' },
  { phase: 'VIDEO', icon: 'videocam', label: 'VIDEO' },
  { phase: 'POST', icon: 'share', label: 'POST' },
];

const BottomNavigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentPhase = useAppSelector(state => state.navigation.currentPhase);
  const phasesCompleted = useAppSelector(state => state.navigation.phasesCompleted);
  
  const handlePhaseChange = (phase: PhaseType) => {
    dispatch(setCurrentPhase(phase));
  };
  
  const isPhaseAvailable = (phase: PhaseType) => {
    // Determine if a phase should be interactive based on completion of previous phases
    const phaseOrder: PhaseType[] = ['STYLE', 'STORY', 'BOARD', 'VIDEO', 'POST'];
    const currentPhaseIndex = phaseOrder.indexOf(currentPhase);
    const targetPhaseIndex = phaseOrder.indexOf(phase);
    
    // Allow moving backward or to the next unlocked phase
    return targetPhaseIndex <= currentPhaseIndex + 1;
  };
  
  return (
    <div className="bg-white border-t border-neutral-100 px-4 py-3 flex justify-between items-center">
      {navItems.map((item) => {
        const isActive = currentPhase === item.phase;
        const isAvailable = isPhaseAvailable(item.phase);
        const isCompleted = phasesCompleted.includes(item.phase);
        
        return (
          <div 
            key={item.phase}
            className="flex flex-col items-center"
            onClick={() => isAvailable && handlePhaseChange(item.phase)}
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isActive 
                  ? 'bg-primary text-white' 
                  : isCompleted 
                    ? 'bg-primary bg-opacity-20 text-primary' 
                    : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              <span className="material-icons">{item.icon}</span>
            </div>
            <span 
              className={`text-xs mt-1 ${
                isActive 
                  ? 'text-primary font-medium' 
                  : isCompleted 
                    ? 'text-primary' 
                    : 'text-neutral-400'
              }`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
