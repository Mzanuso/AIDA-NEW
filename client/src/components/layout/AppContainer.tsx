import React, { ReactNode } from 'react';
import StatusBar from './StatusBar';
import Header from './Header';
import BottomNavigation from '../navigation/BottomNavigation';

interface AppContainerProps {
  children: ReactNode;
  showHeader?: boolean;
  showNavigation?: boolean;
  showStatusBar?: boolean;
  onBackClick?: () => void;
}

const AppContainer: React.FC<AppContainerProps> = ({
  children,
  showHeader = true,
  showNavigation = true,
  showStatusBar = true,
  onBackClick
}) => {
  return (
    <div className="h-screen max-w-md mx-auto flex flex-col relative overflow-hidden bg-white shadow-lg">
      {showStatusBar && <StatusBar />}
      {showHeader && <Header onBackClick={onBackClick} />}
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </div>
      
      {showNavigation && <BottomNavigation />}
    </div>
  );
};

export default AppContainer;
