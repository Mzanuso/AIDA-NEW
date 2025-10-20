import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import NewAidaLogoAnimation from '@/components/ui/NewAidaLogoAnimation';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { WavePattern, FloatingParticles, AnimatedBackground } from '@/components/ui/Decorators';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const steps = [
    {
      title: "Welcome to AIDA",
      description: "AI-powered video generation that brings your creative vision to life",
      options: []
    },
    {
      title: "What's your goal with AIDA?",
      description: "Help us understand what you're creating",
      options: ["Advertising", "Content Creation", "Filmmaking", "Education"]
    },
    {
      title: "What's your background?",
      description: "Tell us about yourself",
      options: ["Creator", "Marketer", "Filmmaker", "Educator", "Designer", "Other"]
    },
    {
      title: "What's your visual style preference?",
      description: "Choose a style that resonates with you",
      options: ["Cinematic", "Minimal", "Vibrant", "Retro", "Surrealistic"]
    }
  ];

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Sfondo animato globale */}
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      
      {/* Sfondo con particelle interattive */}
      {currentStep === 0 && (
        <div className="absolute inset-0 z-0">
          <ParticleBackground 
            color1="#0092E3" 
            color2="#DD39B0" 
            particleCount={window.innerWidth < 768 ? 40 : 80}
          />
        </div>
      )}
      
      {/* Elementi decorativi */}
      <WavePattern 
        className="absolute bottom-0 left-0 right-0 z-1 w-full" 
        fill="url(#gradient-blue-magenta)" 
        height={window.innerHeight * 0.15}
        width={window.innerWidth}
        translateY={10}
      />
      
      {/* Particles for non-welcome screens */}
      {currentStep > 0 && (
        <FloatingParticles className="absolute inset-0 z-1" particleCount={20} />
      )}

      {/* Progress bar */}
      <div className="progress-bar">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index} 
            className={`progress-segment ${index <= currentStep ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {currentStep === 0 ? (
          // Welcome screen
          <div className="text-center p-6 max-w-2xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8 flex flex-col items-center justify-center"
            >
              {/* Logo Animation */}
              <NewAidaLogoAnimation size={window.innerWidth < 768 ? 100 : 150} />
              
              {/* AIDA text */}
              <div className={`${window.innerWidth < 768 ? 'text-5xl' : 'text-6xl'} font-bold mt-4 mb-2 bg-gradient-to-r from-aida-blue to-aida-magenta bg-clip-text text-transparent`}>
                AIDA
              </div>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-aida-blue to-aida-magenta rounded-full"></div>
            </motion.div>

            <motion.h1 
              className="text-2xl md:text-4xl font-bold mb-4 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {steps[currentStep].title}
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-aida-light-gray mb-12 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {steps[currentStep].description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={nextStep}
                className="gradient-button px-8 py-6 text-lg shadow-lg shadow-aida-blue/20"
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        ) : (
          // Question screens
          <div className="w-full max-w-md px-6">
            <div className="glass-panel rounded-xl p-8 backdrop-blur-md shadow-xl">
              <motion.h2 
                className="text-2xl font-bold mb-3 gradient-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].title}
              </motion.h2>
              
              <motion.p 
                className="text-aida-light-gray mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {steps[currentStep].description}
              </motion.p>

              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {steps[currentStep].options.map((option, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="h-14 w-full border border-aida-light-gray/10 bg-aida-gray/20 hover:bg-aida-gray/40 hover:border-aida-blue/30 text-left justify-start px-4 rounded-lg backdrop-blur-sm transition-all"
                      onClick={nextStep}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Scroll indicator */}
      {currentStep === 0 && (
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <ChevronDown className="animate-bounce text-aida-white/70 w-8 h-8" />
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingScreen;