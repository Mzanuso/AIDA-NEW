import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
  return (
    <button 
      onClick={onBack}
      className="fixed top-5 left-5 z-50 bg-aida-gray/70 backdrop-blur-md rounded-full p-2 text-aida-white"
    >
      <ChevronLeft size={18} />
    </button>
  );
};

export default BackButton;