import React from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { Link } from 'wouter';

interface HeaderProps {
  onBackClick?: () => void;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onBackClick,
  showBackButton = true
}) => {
  const currentPhase = useAppSelector(state => state.navigation.currentPhase);
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };
  
  return (
    <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100">
      <div className="flex items-center">
        {showBackButton && (
          <Link href="/">
            <span 
              className="material-icons text-primary cursor-pointer"
              onClick={handleBackClick}
            >
              arrow_back
            </span>
          </Link>
        )}
        <h1 className="text-xl font-display font-semibold ml-2">{currentPhase}</h1>
      </div>
      <div>
        <span className="material-icons text-neutral-600">more_vert</span>
      </div>
    </div>
  );
};

export default Header;
