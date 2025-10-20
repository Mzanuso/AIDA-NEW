import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  aspect: string;
  title: string;
  description?: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setDragStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 2; // Scroll-speed
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const scrollPosition = containerRef.current.scrollLeft;
    const itemWidth = containerWidth / items.length;
    const newIndex = Math.round(scrollPosition / itemWidth);
    setActiveIndex(newIndex);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="carousel-container flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          WebkitOverflowScrolling: 'touch',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onScroll={handleScroll}
      >
        {/* Tutti gli elementi della stessa dimensione */}
        {items.map((item, index) => (
          <div 
            key={index} 
            className="min-w-[80%] md:min-w-[50%] snap-start px-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-xl overflow-hidden shadow-2xl relative"
            >
              <div className="relative bg-black rounded-lg overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 opacity-50 blur"></div>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {item.type === 'video' ? (
                    <div className="relative w-full">
                      <video
                        className="w-full h-auto"
                        autoPlay
                        muted
                        loop
                        playsInline
                        src={item.src}
                      />
                      {/* Transparent gradient at bottom of video */}
                      <div className="absolute left-0 right-0 bottom-0 h-[250px] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10"></div>
                    </div>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-auto"
                    />
                  )}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className="absolute bottom-0 p-4 text-white z-20">
                  <h3 className="text-lg md:text-xl font-bold">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs md:text-sm text-gray-200">{item.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-3 mt-6">
        {items.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-300 ${
              activeIndex === index 
              ? 'w-3 h-3 bg-gradient-to-r from-primary to-blue-600 rounded-full' 
              : 'w-2.5 h-2.5 bg-white/30 rounded-full'
            }`}
            onClick={() => {
              if (containerRef.current) {
                const scrollTo = index * (containerRef.current.scrollWidth / items.length);
                containerRef.current.scrollTo({
                  left: scrollTo,
                  behavior: 'smooth',
                });
                setActiveIndex(index);
              }
            }}
          />
        ))}
      </div>

      {/* Stili definiti in index.css */}
    </div>
  );
};

export default MediaCarousel;