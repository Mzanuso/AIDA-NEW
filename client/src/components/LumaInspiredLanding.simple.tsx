// Versione SEMPLIFICATA di LumaInspiredLanding per debug
import React from 'react';
import { Button } from '@/components/ui/button';

interface LumaInspiredLandingProps {
  onGetStarted: () => void;
}

const LumaInspiredLanding: React.FC<LumaInspiredLandingProps> = ({ onGetStarted }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0a0f1e, #1a1f3e)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '50px'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        ✨ AIDA - AI Digital Assistant
      </h1>
      <p style={{ fontSize: '20px', marginBottom: '40px', opacity: 0.8 }}>
        Crea video straordinari con l'intelligenza artificiale
      </p>
      <Button onClick={onGetStarted} size="lg">
        Get Started →
      </Button>
    </div>
  );
};

export default LumaInspiredLanding;
