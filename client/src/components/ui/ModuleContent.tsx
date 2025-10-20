import React from 'react';
import { cn } from '@/lib/utils';
import { BackgroundColor } from './BackgroundAnimation';

interface ModuleContentProps {
  children: React.ReactNode;
  className?: string;
  color?: BackgroundColor;
}

/**
 * Componente per il contenuto di un modulo con effetto glassmorphism
 */
const ModuleContent: React.FC<ModuleContentProps> = ({ children, className, color }) => {
  // Funzione per ottenere i colori del bordo in base al colore dello sfondo
  const getBorderGlow = (color?: BackgroundColor) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]';
      case 'red':
        return 'border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]';
      case 'green':
        return 'border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]';
      case 'purple':
        return 'border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]';
      case 'orange':
        return 'border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.15)]';
      case 'teal':
        return 'border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.15)]';
      case 'indigo':
        return 'border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.15)]';
      default:
        return 'border-white/10';
    }
  };

  return (
    <div className={cn(
      "mt-16 p-4 md:p-8 min-h-[calc(100vh-4rem)] relative z-10",
      className
    )}>
      <div className={cn(
        "w-full h-full rounded-xl overflow-hidden bg-black/30 backdrop-blur-lg backdrop-saturate-150",
        "border p-6 text-white transition-all duration-300",
        getBorderGlow(color)
      )}>
        {children}
      </div>
    </div>
  );
};

export default ModuleContent;