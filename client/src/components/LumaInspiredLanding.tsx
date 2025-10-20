import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Play, ArrowRight, Star, Sparkles, Film, Video, Palette, Book, Brain, Zap } from 'lucide-react';
import NewAidaLogoAnimation from '@/components/ui/NewAidaLogoAnimation';
import MediaCarousel from '@/components/ui/MediaCarousel';
import ParallaxSection from '@/components/ui/ParallaxSection';
import SectionTransition, { VerticalReveal } from '@/components/ui/SectionTransition';
// DISABILITATO - ParticleEffect causa errore runtime
// import ParticleEffect from '@/components/ui/ParticleEffect';

interface LumaInspiredLandingProps {
  onGetStarted: () => void;
}

const LumaInspiredLanding: React.FC<LumaInspiredLandingProps> = ({ onGetStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Gestione dello scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Effetti di trasformazione basati sullo scroll
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98]);
  const heroY = useTransform(scrollYProgress, [0, 0.1], [0, -30]);

  // Traccia quando l'utente ha scrollato
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Rileva la sezione attiva durante lo scroll
    const detectSection = () => {
      const sections = document.querySelectorAll('[data-section]');
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      sections.forEach((section) => {
        const sectionElement = section as HTMLElement;
        const sectionTop = sectionElement.offsetTop;
        const sectionHeight = sectionElement.offsetHeight;
        const sectionId = sectionElement.getAttribute('data-section') || '';

        if (scrollPosition >= sectionTop && scrollPosition <= sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', detectSection);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', detectSection);
    };
  }, []);

  // Media carousel items con i video "carosello"
  const carouselItems = [
    {
      type: "video" as const,
      src: "/assets/videos/carosello 1.mp4",
      aspect: "16/9",
      title: "Natural, believable motion",
      description: "Our advanced AI generates smooth, realistic animations"
    },
    {
      type: "video" as const,
      src: "/assets/videos/carosello 2.mp4",
      aspect: "16/9",
      title: "Flexible aspect ratio output",
      description: "Customize your videos for any platform or device"
    },
    {
      type: "video" as const,
      src: "/assets/videos/carosello 3.mp4",
      aspect: "16/9",
      title: "High-quality visuals",
      description: "Stunning image quality that stands out"
    },
    {
      type: "video" as const,
      src: "/assets/videos/carosello 4.mp4",
      aspect: "16/9",
      title: "Advanced style matching",
      description: "Consistently maintain your selected visual style"
    },
    {
      type: "video" as const,
      src: "/assets/videos/carosello 5.mp4",
      aspect: "16/9",
      title: "Consistent animation style",
      description: "Your style remains coherent throughout the video"
    },
    {
      type: "video" as const,
      src: "/assets/videos/carosello 8.mp4",
      aspect: "16/9",
      title: "Stunning transitions",
      description: "Smooth motion between scenes enhances storytelling"
    },
    {
      type: "video" as const,
      src: "/assets/videos/carosello7.mp4",
      aspect: "16/9",
      title: "Creative effects",
      description: "Add dynamic elements that bring your content to life"
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

  return (
    <div ref={containerRef} className="bg-black text-white overflow-x-hidden relative">
      {/* Effetto particelle di sfondo - DISABILITATO causa errore runtime */}
      {/* <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <ParticleEffect count={60} color="rgba(255,255,255,0.7)" />
      </div> */}
      
      {/* Header con navigazione */}
      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/80 backdrop-blur-lg py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <NewAidaLogoAnimation width={40} height={40} />
            <span className="text-xl font-bold">AIDA</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className={`text-sm font-medium transition-colors ${
                activeSection === 'features' ? 'text-primary' : 'text-white/70 hover:text-white'
              }`}
            >
              Features
            </a>
            <a 
              href="#workflow" 
              className={`text-sm font-medium transition-colors ${
                activeSection === 'workflow' ? 'text-primary' : 'text-white/70 hover:text-white'
              }`}
            >
              Workflow
            </a>
            <a 
              href="#technology" 
              className={`text-sm font-medium transition-colors ${
                activeSection === 'technology' ? 'text-primary' : 'text-white/70 hover:text-white'
              }`}
            >
              Technology
            </a>
            <a 
              href="#showcase" 
              className={`text-sm font-medium transition-colors ${
                activeSection === 'showcase' ? 'text-primary' : 'text-white/70 hover:text-white'
              }`}
            >
              Showcase
            </a>
          </nav>
          <div>
            <Button 
              variant="default" 
              size="sm" 
              onClick={onGetStarted}
              className="bg-white text-black hover:bg-white/90"
            >
              Get Started <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        data-section="hero"
        className="relative min-h-screen flex items-end justify-center px-4 md:px-0 pb-32"
        style={{ 
          opacity: heroOpacity,
          scale: heroScale,
          y: heroY
        }}
      >
        {/* Video di sfondo fullscreen - senza overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video 
            className="absolute w-full h-full object-cover" 
            autoPlay 
            muted 
            loop 
            playsInline
            src="/assets/videos/prima.mp4"
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-2">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 1, 0] }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[120%] h-[120%] bg-gradient-to-br from-primary/30 via-transparent to-blue-600/20 opacity-30 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <NewAidaLogoAnimation width={120} height={120} className="mx-auto" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight section-title"
          >
            AI-Driven Animation <br className="hidden md:block" /><span className="text-primary">Revolution</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10"
          >
            Create stunning videos with our cutting-edge AI technology. 
            From concept to final render, AIDA streamlines your creative process.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              onClick={onGetStarted} 
              className="bg-primary hover:bg-primary/90 text-white font-medium"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => {
                const showcaseSection = document.querySelector('#showcase');
                if (showcaseSection) {
                  showcaseSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Play className="mr-2 h-5 w-5" /> Watch Demo
            </Button>
          </motion.div>

          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronRight className="h-8 w-8 rotate-90 text-white/50" />
          </div>
        </div>
      </motion.section>

      {/* Features section */}
      <section 
        id="features" 
        data-section="features"
        className="py-20 md:py-32 relative overflow-hidden"
      >
        <VerticalReveal className="mb-16">
          <div className="container mx-auto text-center px-4 md:px-0 relative z-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 section-title">Powerful Features</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto relative z-20">
              AIDA combines advanced AI technology with intuitive design to deliver exceptional video creation capabilities.
            </p>
          </div>
        </VerticalReveal>

        <div className="container mx-auto mt-16 mb-24 px-4 md:px-0">
          <MediaCarousel items={carouselItems} />
        </div>

        <div className="container mx-auto mt-20 px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors group hover-scale h-full flex flex-col"
            >
              <div className="bg-primary/20 p-3 rounded-lg inline-block mb-4">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors gradient-text">AI-Powered Workflow</h3>
              <p className="text-white/70 break-words">Leverage multiple specialized AI agents that collaborate to transform your concept into reality.</p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors group hover-scale h-full flex flex-col"
            >
              <div className="bg-primary/20 p-3 rounded-lg inline-block mb-4">
                <Palette className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors gradient-text">Style Reference System</h3>
              <p className="text-white/70 break-words">Our SREF system ensures stylistic consistency throughout your entire project.</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors group hover-scale h-full flex flex-col"
            >
              <div className="bg-primary/20 p-3 rounded-lg inline-block mb-4">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors gradient-text">Rapid Generation</h3>
              <p className="text-white/70 break-words">Create high-quality animation in a fraction of the time required by traditional methods.</p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors group hover-scale h-full flex flex-col"
            >
              <div className="bg-primary/20 p-3 rounded-lg inline-block mb-4">
                <Star className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors gradient-text">Quality Assurance</h3>
              <p className="text-white/70 break-words">Advanced algorithms ensure high-quality output at every stage of the creative process.</p>
            </motion.div>

            {/* Card 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors group hover-scale h-full flex flex-col"
            >
              <div className="bg-primary/20 p-3 rounded-lg inline-block mb-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors gradient-text">Creative Enhancement</h3>
              <p className="text-white/70 break-words">AI suggestions help refine and enhance your creative vision throughout the process.</p>
            </motion.div>

            {/* Card 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors group hover-scale h-full flex flex-col"
            >
              <div className="bg-primary/20 p-3 rounded-lg inline-block mb-4">
                <Film className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors gradient-text">Complete Toolset</h3>
              <p className="text-white/70 break-words">Everything you need from initial concept to final video export in one platform.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Workflow section */}
      <section 
        id="workflow" 
        data-section="workflow"
        className="py-20 md:py-32 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-primary/5 to-black opacity-50"></div>
        
        <VerticalReveal className="mb-16">
          <div className="container mx-auto text-center px-4 md:px-0 relative z-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 section-title">Streamlined Workflow</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto relative z-20">
              Our intuitive phase-based approach guides you from concept to finished video.
            </p>
          </div>
        </VerticalReveal>

        <div className="container mx-auto relative z-10 px-4 md:px-0">
          {phases.map((phase, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="mb-24 last:mb-0 w-full"
            >
              <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}>
                <div className="w-full md:w-1/2">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 opacity-50 blur"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/10 overflow-hidden">
                      <img src={phase.image} alt={phase.title} className="w-full h-auto rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      {phase.icon}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold gradient-text">{phase.title}</h3>
                  </div>
                  <p className="text-white/80 text-lg mb-6">
                    {phase.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={onGetStarted}
                  >
                    Explore {phase.title} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology section */}
      <section 
        id="technology" 
        data-section="technology"
        className="py-20 md:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/20 via-transparent to-blue-600/20 opacity-30 blur-3xl"></div>
        </div>
        
        <VerticalReveal className="mb-16">
          <div className="container mx-auto text-center px-4 md:px-0 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 section-title">Advanced Technology</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              AIDA leverages cutting-edge AI models and sophisticated algorithms to deliver exceptional results.
            </p>
          </div>
        </VerticalReveal>

        <div className="container mx-auto px-4 md:px-0 relative z-10">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
            <SectionTransition direction="bottom">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 gradient-text">Multi-Agent AI System</h3>
                  <p className="text-white/80 mb-6">
                    AIDA utilizes multiple specialized AI agents working in concert to handle different aspects of the creative process:
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/20 p-1 rounded-lg mt-1">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="font-bold block gradient-text">Writer Agent</span>
                        <span className="text-white/70">Creates compelling narratives and scripts based on your brief</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/20 p-1 rounded-lg mt-1">
                        <Film className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="font-bold block gradient-text">Director Agent</span>
                        <span className="text-white/70">Translates scripts into visual directions and storyboards</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/20 p-1 rounded-lg mt-1">
                        <Palette className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="font-bold block gradient-text">Style Agent</span>
                        <span className="text-white/70">Ensures consistent visual styling throughout the project</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 opacity-75 blur rounded-lg"></div>
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video 
                      className="w-full h-auto scale-110" 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      src="/assets/videos/AIDA in azione.mp4"
                    />
                  </div>
                </div>
              </div>
            </SectionTransition>
          </div>
        </div>
      </section>

      {/* Showcase section */}
      <section 
        id="showcase" 
        data-section="showcase"
        className="py-20 md:py-32 relative"
      >
        <VerticalReveal className="mb-16">
          <div className="container mx-auto text-center px-4 md:px-0 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 section-title">See AIDA in Action</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto relative z-20">
              Explore examples of what you can create with our AI-powered platform.
            </p>
          </div>
        </VerticalReveal>

        <div className="container mx-auto px-4 md:px-0">
          <SectionTransition>
            <div className="aspect-video w-full max-w-4xl mx-auto relative rounded-xl overflow-hidden">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 opacity-50 blur"></div>
              <div className="relative">
                <video 
                  className="w-full h-auto" 
                  controls 
                  src="/assets/videos/AIDA in azione.mp4"
                  poster="/assets/images/p5.png"
                />
              </div>
            </div>
          </SectionTransition>

          <div className="flex justify-center mt-12">
            <Button 
              size="lg" 
              onClick={onGetStarted} 
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Start Creating Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-primary/10 to-black"></div>
        
        <div className="container mx-auto px-4 md:px-0 relative z-10">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-16 text-center">
            <SectionTransition>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 section-title">Ready to Transform Your Ideas?</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                Start creating stunning videos with AIDA today and unlock new creative possibilities.
              </p>
              <Button 
                size="lg" 
                onClick={onGetStarted} 
                className="bg-white text-black hover:bg-white/90"
              >
                Get Started Now <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </SectionTransition>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-0">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <NewAidaLogoAnimation width={30} height={30} />
              <span className="text-xl font-bold">AIDA</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <a href="#features" className="text-sm text-white/70 hover:text-white">Features</a>
              <a href="#workflow" className="text-sm text-white/70 hover:text-white">Workflow</a>
              <a href="#technology" className="text-sm text-white/70 hover:text-white">Technology</a>
              <a href="#showcase" className="text-sm text-white/70 hover:text-white">Showcase</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/50 text-sm">
            &copy; {new Date().getFullYear()} AIDA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LumaInspiredLanding;