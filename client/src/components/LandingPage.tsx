import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useAnimation } from 'framer-motion';
import AidaLogoAnimation from '@/components/ui/AidaLogoAnimation';
import { Button } from '@/components/ui/button';
import { ChevronRight, Play, ChevronDown, ArrowRight, Star, Sparkles, Film, Video, Palette, Book, Brain, Zap } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  // Setup base scroll detection
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Effetti di fade e transform basati sullo scroll
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  // Refs per animazioni in-view
  const overviewRef = useRef<HTMLDivElement>(null);
  const isOverviewInView = useInView(overviewRef, { once: true, amount: 0.3 });
  const overviewControls = useAnimation();

  useEffect(() => {
    if (isOverviewInView) {
      overviewControls.start('visible');
    }
  }, [isOverviewInView, overviewControls]);

  // Carousel videos
  const carouselItems = [
    {
      type: "video",
      src: "/assets/videos/music-intro.mp4",
      aspect: "16/9",
      title: "Natural, believable Motion"
    },
    {
      type: "video",
      src: "/assets/videos/buttonvideo_2.mp4",
      aspect: "4/3",
      title: "Flexible aspect ratio output"
    },
    {
      type: "image",
      src: "/assets/images/p1.png",
      aspect: "16/9",
      title: "High-quality visuals"
    },
    {
      type: "image",
      src: "/assets/images/p2.png",
      aspect: "16/9",
      title: "Advanced style matching"
    },
    {
      type: "image",
      src: "/assets/images/p3.png",
      aspect: "16/9",
      title: "Consistent animation style"
    }
  ];

  // Sezioni informative con immagini/video
  const phases = [
    {
      title: "Style Phase",
      icon: <Palette className="w-10 h-10 text-primary" />,
      description: "Choose from a curated selection of visual styles to define the look of your video. Our unique SREF system provides high-quality, consistent references to guide the AI generation.",
      image: "/assets/images/p1.png",
    },
    {
      title: "Storytelling Phase",
      icon: <Book className="w-10 h-10 text-primary" />,
      description: "Describe your vision and let our AI Writer Agent craft a compelling narrative structure. From short-form content to full-length scripts, AIDA adapts to your creative needs.",
      image: "/assets/images/p2.png",
    },
    {
      title: "Storyboard Phase",
      icon: <Film className="w-10 h-10 text-primary" />,
      description: "Transform your story into visual frames with our AI-powered storyboard generator. Each frame is carefully composed based on your selected style and narrative.",
      image: "/assets/images/p3.png",
    },
    {
      title: "Video & Audio Phase",
      icon: <Video className="w-10 h-10 text-primary" />,
      description: "Bring your storyboard to life with cutting-edge AI video and audio generation. Add music, effects, and voiceovers for a professional finished product.",
      image: "/assets/images/p4.png",
    }
  ];

  // Features in formato griglia
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Writer Agent",
      description: "Advanced natural language processing to create engaging scripts and narratives."
    },
    {
      icon: <Film className="w-6 h-6" />,
      title: "AI Director Agent",
      description: "Intelligent scene composition and cinematography guidance."
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Style Reference System",
      description: "Expansive database of visual styles to choose from."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Midjourney Integration",
      description: "Generate stunning visuals powered by Midjourney technology."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Claude Integration",
      description: "Leverage Anthropic's Claude for sophisticated text generation."
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "Collaborative Workflow",
      description: "Seamless transitions between AI-assisted phases."
    }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-black text-white">
      {/* Header che appare durante lo scroll */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-6 bg-black/60 backdrop-blur-md"
        style={{ opacity: headerOpacity }}
      >
        <div className="flex items-center">
          <img src="/assets/images/luma.svg" alt="AIDA" className="h-8" />
        </div>
        <Button
          onClick={onGetStarted}
          className="bg-white hover:bg-white/90 text-black rounded-full px-6"
        >
          Get Started
        </Button>
      </motion.header>

      {/* Hero section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-8 overflow-hidden">
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="mb-12"
          >
            <img src="/assets/images/luma.svg" alt="AIDA" className="h-12 md:h-16 mx-auto" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-7xl font-bold mb-6 leading-tight"
          >
            AI-Powered<br />Video Creation
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            Transform your creative vision into stunning videos with AIDA's
            intelligent, multi-phase workflow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={onGetStarted}
              className="bg-white hover:bg-white/90 text-black rounded-full px-8 py-6 text-lg"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              className="border-white/30 hover:border-white/60 text-white rounded-full px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </motion.div>
        </div>

        {/* Background video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            className="absolute w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            src="/assets/videos/music-intro.mp4"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <ChevronDown className="animate-bounce text-white/70 w-8 h-8" />
        </motion.div>
      </section>

      {/* Media carousel section */}
      <section ref={overviewRef} className="py-20 md:py-32 px-4 md:px-8 relative bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={isOverviewInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Create Videos That Inspire
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              AIDA streamlines the video creation process through an intuitive, 
              phase-based approach that combines cutting-edge AI with your creative direction.
            </p>
          </motion.div>

          {/* Carousel Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="col-span-2 aspect-video rounded-lg overflow-hidden">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                src="/assets/videos/music-intro.mp4"
              />
            </div>
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src="/assets/images/p1.png"
                alt="AI Generated Imagery" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src="/assets/images/p2.png"
                alt="AI Generated Imagery" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="col-span-2 aspect-video rounded-lg overflow-hidden">
              <img 
                src="/assets/images/p3.png"
                alt="AI Generated Imagery" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Powerful Features
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              AIDA combines multiple AI technologies to provide an unmatched video creation experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const featureRef = useRef<HTMLDivElement>(null);
              const isFeatureInView = useInView(featureRef, { once: true, amount: 0.1 });
              
              return (
                <motion.div
                  key={index}
                  ref={featureRef}
                  className="bg-gray-900/50 border border-gray-800 p-6 md:p-8 rounded-xl h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isFeatureInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="p-3 bg-white/10 w-fit rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 break-words">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Phases section */}
      {phases.map((phase, index) => {
        const phaseRef = useRef<HTMLDivElement>(null);
        const isPhaseInView = useInView(phaseRef, { once: true, amount: 0.2 });
        
        return (
          <section 
            key={index}
            ref={phaseRef}
            className={`py-16 md:py-24 px-4 md:px-8 ${index % 2 === 0 ? 'bg-black' : 'bg-gray-950'}`}
          >
            <div className="max-w-7xl mx-auto">
              <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}>
                <motion.div 
                  className="flex-1"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={isPhaseInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-xl bg-white/10 mr-4">
                      {phase.icon}
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold">
                      {phase.title}
                    </h2>
                  </div>
                  
                  <p className="text-base md:text-lg text-gray-400 mb-6">
                    {phase.description}
                  </p>
                  
                  <Button variant="outline" className="border-white/30 hover:border-white/60">
                    Learn More <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
                
                <motion.div 
                  className="flex-1"
                  initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                  animate={isPhaseInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="rounded-xl overflow-hidden shadow-lg shadow-black/50">
                    <img 
                      src={phase.image} 
                      alt={phase.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA section */}
      <section className="py-20 md:py-32 px-4 md:px-8 bg-gradient-to-b from-gray-950 to-black text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Create with AIDA?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Start your creative journey today and experience the future of AI-powered video creation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onGetStarted}
              className="bg-white hover:bg-white/90 text-black rounded-full px-8 py-6 text-lg"
            >
              Get Started Now
            </Button>
            <Button
              variant="outline"
              className="border-white/30 hover:border-white/60 text-white rounded-full px-8 py-6 text-lg"
            >
              Watch Demo <Play className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 md:px-8 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <img src="/assets/images/luma.svg" alt="AIDA" className="h-8" />
          </div>
          <div className="text-gray-400 text-sm">
            © 2025 AIDA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;