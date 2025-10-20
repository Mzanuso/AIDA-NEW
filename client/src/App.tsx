import React, { useState, useEffect, Suspense } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { store } from './lib/redux/store';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Home from '@/pages/home';
import PlanPage from '@/pages/PlanPage';
import StoryboardSettings from '@/pages/StoryboardSettings';

// Nuove pagine dei moduli
import ScriptPage from '@/pages/ScriptPage';
import CastPage from '@/pages/CastPage';
import BoardPage from '@/pages/BoardPage';
import StoryPage from '@/pages/StoryPage';
import MediaPage from '@/pages/MediaPage';
import VideoPage from '@/pages/VideoPage';

// Components
import OnboardingScreen from '@/components/OnboardingScreen';
import LandingPage from '@/components/LandingPage';
import LumaInspiredLanding from '@/components/LumaInspiredLanding';
import Launchpad from '@/components/hub/Launchpad';
import StylePhase from '@/components/StylePhase';
import StorytellingPhase from '@/components/StorytellingPhase';
import StoryboardPhase from '@/components/StoryboardPhase';
import VideoPhase from '@/components/VideoPhase';
import PhaseIndicator, { AppPhase } from '@/components/ui/PhaseIndicator';
import BackButton from '@/components/ui/BackButton';

// Convenience import for development
import AiImageTest from '@/pages/AiImageTest';
import SrefManager from '@/pages/SrefManager';
import AidaHubTest from '@/pages/AidaHubTest';

import TemplatesPage from '@/pages/TemplatesPage';

function AidaApp() {
  const [currentPhase, setCurrentPhase] = useState<AppPhase | 'landing'>('landing'); // Aggiungiamo la fase 'landing'
  const [showBackButton, setShowBackButton] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const [storyContent, setStoryContent] = useState<any>(null);
  const [scenes, setScenes] = useState<any[]>([]);
  
  // Set back button visibility based on current phase
  useEffect(() => {
    setShowBackButton(currentPhase !== 'onboarding' && currentPhase !== 'landing' && currentPhase !== 'hub');
  }, [currentPhase]);
  
  // Handle back button navigation
  const handleBack = () => {
    switch (currentPhase) {
      case 'onboarding':
        setCurrentPhase('hub');
        break;
      case 'style':
        setCurrentPhase('onboarding');
        break;
      case 'storytelling':
        setCurrentPhase('style');
        break;
      case 'storyboard':
        setCurrentPhase('storytelling');
        break;
      case 'video':
        setCurrentPhase('storyboard');
        break;
      default:
        break;
    }
  };
  
  // Handle landing page get started button
  const handleGetStarted = () => {
    // Vai alla fase hub (Launchpad/Chat)
    setCurrentPhase('hub');
  };
  
  // Handle phase completion functions
  const handleOnboardingComplete = () => {
    setCurrentPhase('style');
  };
  
  const handleStyleSelect = (style: any) => {
    setSelectedStyle(style);
    setCurrentPhase('storytelling');
  };
  
  const handleStorySelect = (story: any) => {
    setStoryContent(story);
    setCurrentPhase('storyboard');
  };
  
  const handleStoryboardComplete = (completedScenes: any[]) => {
    setScenes(completedScenes);
    setCurrentPhase('video');
  };
  
  const handleVideoExport = (videoData: any) => {
    console.log('Video export data:', videoData);
    // In una versione reale, qui salveremmo il progetto e reindirizzeremmo alla dashboard
    alert('Congratulations! Your video has been created successfully.');
    setCurrentPhase('landing'); // Torna alla landing page invece dell'onboarding
    setSelectedStyle(null);
    setStoryContent(null);
    setScenes([]);
  };
  
  return (
    <div className="relative">
      {/* Phase indicator (non mostrato per landing, hub e onboarding) */}
      {currentPhase !== 'onboarding' && currentPhase !== 'landing' && currentPhase !== 'hub' && (
        <PhaseIndicator currentPhase={currentPhase as AppPhase} />
      )}
      
      {/* Back button */}
      {showBackButton && (
        <BackButton onBack={handleBack} />
      )}
      
      {/* Landing page */}
      {currentPhase === 'landing' && (
        <LumaInspiredLanding onGetStarted={handleGetStarted} />
      )}

      {/* Hub/Launchpad - Chat interface */}
      {currentPhase === 'hub' && (
        <Launchpad />
      )}

      {/* Phases */}
      {currentPhase === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      
      {currentPhase === 'style' && (
        <StylePhase onStyleSelect={handleStyleSelect} />
      )}
      
      {currentPhase === 'storytelling' && selectedStyle && (
        <StorytellingPhase 
          selectedStyle={selectedStyle} 
          onStorySelect={handleStorySelect} 
        />
      )}
      
      {currentPhase === 'storyboard' && selectedStyle && storyContent && (
        <StoryboardPhase 
          selectedStyle={selectedStyle}
          storyContent={storyContent}
          onComplete={handleStoryboardComplete}
        />
      )}
      
      {currentPhase === 'video' && selectedStyle && storyContent && scenes.length > 0 && (
        <VideoPhase 
          selectedStyle={selectedStyle}
          storyContent={storyContent}
          scenes={scenes}
          onExport={handleVideoExport}
        />
      )}
    </div>
  );
}

// Loading spinner per i componenti lazy-loaded
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  const [location] = useLocation();
  
  // Determine if we should show AIDA app or other routes
  const isMainApp = location === '/' || location === '';

  return (
    <Switch>
      <Route path="/" component={AidaApp} />

      {/* Vecchia route di stile (deprecata) */}
      <Route path="/style-old" component={() => <StylePhase onStyleSelect={() => {}} />} />
      
      {/* Nuove pagine dei moduli */}
      <Route path="/script" component={ScriptPage} />
      <Route path="/cast" component={CastPage} />
      <Route path="/board" component={BoardPage} />
      <Route path="/story" component={StoryPage} />
      <Route path="/media" component={MediaPage} />
      <Route path="/video" component={VideoPage} />
      
      {/* Altre pagine */}
      <Route path="/sref-manager" component={SrefManager} />
      <Route path="/ai-image-test" component={AiImageTest} />
      <Route path="/aida-hub" component={AidaHubTest} />
      <Route path="/hub" component={AidaHubTest} />
      <Route path="/templates" component={(props: any) => <TemplatesPage {...props} />} />
      <Route path="/plan" component={PlanPage} />
      <Route path="/storyboard-settings" component={StoryboardSettings} />
      
      {/* Questa route gestisce tutti gli URL non definiti sopra */}
      <Route path="*" component={AidaApp} />
    </Switch>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
