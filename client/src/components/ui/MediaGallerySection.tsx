import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Definizione del tipo per gli elementi multimediali
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  title: string;
  description?: string;
  aspectRatio?: string;
  width?: number;
}

interface MediaGallerySectionProps {
  items: MediaItem[];
  title?: string;
  description?: string;
  darkMode?: boolean;
}

/**
 * Componente per una galleria media immersiva con trascinamento orizzontale
 * Ispirato dal design di lumalabs.ai
 */
const MediaGallerySection: React.FC<MediaGallerySectionProps> = ({
  items,
  title,
  description,
  darkMode = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Parallax effect sullo scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Trasformazioni per effetto parallasse
  const y = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    ['0%', '-5%', '0%']
  );

  // Get random size based on item index (consistent)
  const getItemSize = (index: number) => {
    // Pattern simile a quello di lumalabs.ai - alternare elementi grandi e piccoli
    const sizes = [
      { width: '60%', height: '60vh' },  // Grande orizzontale
      { width: '30%', height: '40vh' },  // Piccolo verticale
      { width: '45%', height: '30vh' },  // Medio orizzontale
      { width: '25%', height: '50vh' },  // Stretto verticale
      { width: '40%', height: '40vh' },  // Quadrato medio
    ];
    
    return sizes[index % sizes.length];
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden py-[8vmax]"
    >
      {/* Header section */}
      {(title || description) && (
        <div className="px-4 md:px-8 py-10 md:py-16 max-w-6xl mx-auto">
          {title && (
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-aida-blue to-aida-magenta bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg md:text-xl text-aida-light-gray max-w-3xl">
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Media gallery con drag orizzontale */}
      <motion.div 
        className="relative h-full w-full"
        style={{ y }}
      >
        <div 
          className="relative h-full overflow-x-auto overflow-y-hidden no-scrollbar"
        >
          {/* Container con effetto di trascinamento */}
          <motion.div
            ref={carouselRef}
            className={`flex gap-[3vmax] py-8 px-[8vw] cursor-grab active:cursor-grabbing`}
            drag="x"
            dragConstraints={{ 
              left: (carouselRef.current && window.innerWidth) 
                ? -((items.length * 400) - window.innerWidth + 100) 
                : -2000, 
              right: 0 
            }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            style={{
              minWidth: `${items.length * 40}vw`,
            }}
          >
            {items.map((item, index) => {
              const size = getItemSize(index);
              
              return (
                <motion.div
                  key={item.id}
                  className="relative overflow-hidden rounded-xl shadow-lg"
                  style={{
                    width: item.width ? `${item.width}px` : size.width,
                    height: size.height,
                    aspectRatio: item.aspectRatio,
                    willChange: 'transform', // Ottimizzazione performance
                  }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                >
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-aida-dark via-transparent to-transparent z-10"></div>
                  
                  {/* Media content */}
                  {item.type === 'video' ? (
                    <video
                      className="w-full h-full object-cover"
                      src={item.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      draggable="false"
                    />
                  )}
                  
                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 p-4 z-20">
                    <h3 className="text-white text-lg font-medium">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-white/80 text-sm mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MediaGallerySection;