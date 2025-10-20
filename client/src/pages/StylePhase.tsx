import React, { useEffect } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { updatePhaseProgress } from '@/lib/redux/slices/navigationSlice';
import AppContainer from '@/components/layout/AppContainer';
import ProgressIndicator from '@/components/navigation/ProgressIndicator';
import SwipeCard from '@/components/style/SwipeCard';
import MoodboardEvolutivo from '@/components/style/MoodboardEvolutivo';
import ExploreModal from '@/components/style/ExploreModal';

const StylePhase: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Update navigation progress when component mounts
  useEffect(() => {
    dispatch(updatePhaseProgress({ phase: 'STYLE', progress: 0 }));
  }, [dispatch]);
  
  return (
    <AppContainer>
      <ProgressIndicator />
      
      <SwipeCard />
      
      <MoodboardEvolutivo />
      
      <ExploreModal />
    </AppContainer>
  );
};

export default StylePhase;
