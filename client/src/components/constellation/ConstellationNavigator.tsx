import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Compass, HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import ModuleNode, { ModuleType, ModuleStatus } from './ModuleNode';
import ModuleConnection, { ConnectionStatus } from './ModuleConnection';

// Define module connection interface
interface ModuleConnection {
  source: ModuleType;
  target: ModuleType;
  status: ConnectionStatus;
}

interface ConstellationNavigatorProps {
  currentProject?: number;
  activeModule?: ModuleType;
  moduleStatuses: Record<ModuleType, ModuleStatus>;
  connections: ModuleConnection[];
  expanded?: boolean;
  orientation?: 'vertical' | 'horizontal';
  onModuleSelect: (type: ModuleType) => void;
  onToggleExpand?: () => void;
}

const ConstellationNavigator: React.FC<ConstellationNavigatorProps> = ({
  currentProject,
  activeModule,
  moduleStatuses,
  connections,
  expanded = false,
  orientation = 'vertical',
  onModuleSelect,
  onToggleExpand
}) => {
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [helpDialogContent, setHelpDialogContent] = useState<{ title: string; description: string }>({
    title: '',
    description: ''
  });
  const [positions, setPositions] = useState<Record<ModuleType, { x: number; y: number }>>({} as any);

  // Define module positions - sempre in orizzontale e responsive
  useEffect(() => {
    // Determina larghezza della viewport
    const getModulePositions = () => {
      const viewportWidth = window.innerWidth;
      // Calcolo dinamico dello spacing in base alla larghezza dello schermo
      let spacing, startX, centerY;
      
      if (viewportWidth < 640) { // Small Mobile
        spacing = 90;
        startX = 50;
        centerY = 55;
      } else if (viewportWidth < 768) { // Mobile
        spacing = 100;
        startX = 60;
        centerY = 60;
      } else if (viewportWidth < 1024) { // Small Tablet
        spacing = 120;
        startX = 80;
        centerY = 60;
      } else if (viewportWidth < 1280) { // Tablet
        spacing = 140;
        startX = 100;
        centerY = 65;
      } else { // Desktop
        spacing = 160;
        startX = 120;
        centerY = 65;
      }
      
      return {
        style:        { x: startX,               y: centerY },
        storytelling: { x: startX + spacing,     y: centerY },
        characters:   { x: startX + spacing * 2, y: centerY },
        media:        { x: startX + spacing * 3, y: centerY },
        storyboard:   { x: startX + spacing * 4, y: centerY },
        video:        { x: startX + spacing * 5, y: centerY }
      };
    };
    
    // Imposta le posizioni iniziali
    setPositions(getModulePositions());
    
    // Aggiorna le posizioni quando cambia la dimensione della finestra
    const handleResize = () => {
      setPositions(getModulePositions());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle module action menu
  const handleModuleAction = (action: string, type: ModuleType) => {
    switch (action) {
      case 'quick_setup':
        // Logic for quick setup
        console.log(`Quick setup for ${type}`);
        break;
      case 'view_dependencies':
        // Show dependencies in a dialog
        showDependenciesDialog(type);
        break;
      case 'reset':
        // Logic for resetting module
        console.log(`Reset ${type}`);
        break;
      default:
        break;
    }
  };

  // Show dependencies help dialog
  const showDependenciesDialog = (type: ModuleType) => {
    const module = moduleStatuses[type];
    if (!module) return;

    const dependencies = module.dependencies || [];
    let description = dependencies.length === 0 
      ? 'This module has no dependencies and can be started at any time.'
      : 'This module depends on:';
    
    if (dependencies.length > 0) {
      description += dependencies.map(dep => `\n• ${dep.charAt(0).toUpperCase() + dep.slice(1)}`).join('');
      description += '\n\nComplete these modules first to unlock full functionality.';
    }

    setHelpDialogContent({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Dependencies`,
      description
    });
    setShowInfoDialog(true);
  };

  // Animation variants
  const containerVariants = {
    initial: {
      opacity: 0,
      x: orientation === 'vertical' ? -50 : 0,
      y: orientation === 'horizontal' ? 50 : 0
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1.0] }
    }
  };

  // Calculate navigator dimensions based on orientation
  const getNavigatorDimensions = () => {
    // Sempre orientamento orizzontale (in basso) - solo linguetta visibile quando chiuso
    return {
      width: '100%',
      height: expanded ? 110 : 0, // Zero height quando chiuso (solo la linguetta sarà visibile)
      bottom: 0,
      left: 0
    };
  };

  // Size of module nodes based on expansion state
  const nodeSize = expanded ? 50 : 40;

  return (
    <motion.div
      className={`fixed bg-gray-900/80 backdrop-blur-sm border-t border-gray-700`}
      style={{
        ...getNavigatorDimensions(),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        zIndex: 40,
        boxShadow: expanded ? '0 -5px 20px rgba(0,0,0,0.5)' : 'none',
        borderRadius: !expanded ? '10px 10px 0 0' : '0'
      }}
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      {/* Title area - Icon cliccabile per espandere/chiudere il navigator */}
      {expanded ? (
        <div className="flex justify-center w-full h-5">
          <motion.div 
            className="cursor-pointer hover:bg-gray-800 bg-gray-900/90 rounded-md px-8 py-0 transition-colors"
            onClick={onToggleExpand}
            animate={{ y: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.9)" }}
          >
            <motion.div
              animate={{ y: [0, 1.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }}
            >
              <ChevronRight size={10} className="text-blue-400 rotate-90" />
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-5 cursor-pointer"
          onClick={onToggleExpand}
          style={{ zIndex: 50 }}
        >
          <motion.div 
            className="flex items-center justify-center hover:bg-gray-800 bg-gray-900/90 rounded-md px-8 py-0 transition-colors"
            animate={{ y: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.9)" }}
          >
            <motion.div
              animate={{ y: [0, 1.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }}
            >
              <ChevronRight size={10} className="text-blue-400 -rotate-90" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Constellation container - visibile solo quando expanded=true */}
      {expanded && (
        <div className="relative flex-1 w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
          <div className="w-full min-w-max h-full relative pt-1">
            {/* Connections between modules */}
            {Object.keys(positions).length > 0 && connections.map((connection, index) => (
              <ModuleConnection
                key={`${connection.source}-${connection.target}-${index}`}
                sourcePosition={positions[connection.source]}
                targetPosition={positions[connection.target]}
                status={connection.status}
              />
            ))}

            {/* Module nodes */}
            {Object.entries(moduleStatuses).map(([type, status]) => (
              <ModuleNode 
                key={type}
                type={type as ModuleType}
                status={status}
                position={positions[type as ModuleType] || { x: 0, y: 0 }}
                size={nodeSize}
                onSelect={onModuleSelect}
                onMenuAction={handleModuleAction}
              />
            ))}

            {/* Help button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setHelpDialogContent({
                  title: 'Constellation Navigator',
                  description: 'The Navigator shows all available modules and their dependencies. Completed modules are marked with a check, locked modules with a lock. Follow highlighted paths for the recommended workflow.'
                });
                setShowInfoDialog(true);
              }}
              className="absolute bottom-1 right-4 text-gray-400 hover:text-white"
            >
              <HelpCircle size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* Info Dialog */}
      <AlertDialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <AlertDialogContent className="bg-gray-800 border border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-400">{helpDialogContent.title || "Module Information"}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line text-gray-300">
              {helpDialogContent.description || "Information about this module will be displayed here. This includes dependencies, status, and other relevant details."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-blue-600 hover:bg-blue-700 text-white">Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ConstellationNavigator;