import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import Launchpad from '@/components/hub/Launchpad';
import { ModuleType } from '@/components/hub/ModuleCard';
import MagicPanel from '@/components/modules/MagicPanel';

const AidaHubTest: React.FC = () => {
  const [, setLocation] = useLocation();
  const [magicPanelOpen, setMagicPanelOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<ModuleType>('style');

  // Handlers for the Launchpad
  const handleCreateProject = (templateId?: string) => {
    console.log('Create project', templateId);
    // Aggiungiamo un alert per verificare che il pulsante funzioni
    alert(`Creazione nuovo progetto${templateId ? ` dal template: ${templateId}` : ''}`);
  };

  const handleContinueProject = (projectId: number) => {
    console.log('Continue project', projectId);
  };

  const handleDuplicateProject = (projectId: number) => {
    console.log('Duplicate project', projectId);
  };

  const handleDeleteProject = (projectId: number) => {
    console.log('Delete project', projectId);
  };

  // Handle module selection
  const handleModuleSelect = (moduleType: ModuleType) => {
    setCurrentModule(moduleType);
    console.log('Selected module', moduleType);
    
    // Redirect to the appropriate module page instead of opening the magic panel
    switch (moduleType) {
      case 'style':
        setLocation('/style');
        break;
      case 'storytelling':
        setLocation('/story');
        break;
      case 'characters':
        setLocation('/cast');
        break;
      case 'storyboard':
        setLocation('/board');
        break;
      case 'media':
        setLocation('/media');
        break;
      case 'video':
        setLocation('/video');
        break;
      case 'templates':
        setLocation('/templates');
        break;
      default:
        // Default fallback to old behavior
        setMagicPanelOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Sfondo animato con gradazione */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-[150%] h-[150%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,146,227,0.2) 0%, rgba(0,50,100,0.05) 40%, rgba(0,0,0,0) 70%)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 0.6, 0.8],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 15,
            ease: "easeInOut"
          }}
        />
      </div>


      {/* Main Launchpad Hub */}
      <div className="transition-all duration-300">
        <Launchpad
          userId={1}
          onCreateProject={handleCreateProject}
          onContinueProject={handleContinueProject}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onModuleSelect={handleModuleSelect}
        />
      </div>



      {/* Magic Panel */}
      <MagicPanel
        isOpen={magicPanelOpen}
        moduleType={currentModule}
        onClose={() => setMagicPanelOpen(!magicPanelOpen)}
        onSave={() => {
          console.log('Saving changes for', currentModule);
          setMagicPanelOpen(false);
        }}
        onReset={() => console.log('Reset changes for', currentModule)}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Magic Panel Content for {currentModule}</h3>
          <p className="text-gray-300">
            This panel provides advanced controls for the {currentModule} module. In the real implementation, 
            this would contain module-specific controls.
          </p>
          <div className="p-4 bg-gray-800 rounded-md">
            <p className="text-amber-400 text-sm">Interactive controls would appear here.</p>
          </div>
          <p className="text-gray-400 text-sm">
            The Magic Panel is part of every satellite module, providing a consistent interface 
            for advanced controls across AIDA.
          </p>
        </div>
      </MagicPanel>

      {/* Back button rimosso come richiesto */}
    </div>
  );
};

export default AidaHubTest;