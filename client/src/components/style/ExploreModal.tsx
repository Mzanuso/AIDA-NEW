import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setExploreOpen, updateStyleProfile, generateStyleProfile } from '@/lib/redux/slices/styleSlice';

const ExploreModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isExploreOpen = useAppSelector(state => state.style.isExploreOpen);
  const selectedStyles = useAppSelector(state => state.style.selectedStyles);
  const styleProfile = useAppSelector(state => state.style.styleProfile);
  
  // Generate style profile if it doesn't exist yet
  React.useEffect(() => {
    if (isExploreOpen && !styleProfile && selectedStyles.length > 0) {
      dispatch(generateStyleProfile());
    }
  }, [isExploreOpen, styleProfile, selectedStyles, dispatch]);

  const [textureAmount, setTextureAmount] = useState<number>(styleProfile?.textureAmount || 30);
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [customKeywords, setCustomKeywords] = useState<string[]>(styleProfile?.customKeywords || []);
  const [colorDirection, setColorDirection] = useState<string>(styleProfile?.colorDirection || 'neutral');
  const [lightingStyle, setLightingStyle] = useState<string>(styleProfile?.lightingStyle || 'Natural');

  const handleCloseExplore = () => {
    dispatch(setExploreOpen(false));
  };
  
  const handleApplyChanges = () => {
    dispatch(updateStyleProfile({
      textureAmount,
      customKeywords,
      colorDirection,
      lightingStyle
    }));
    dispatch(setExploreOpen(false));
  };

  const handleAddKeyword = () => {
    if (newKeyword && !customKeywords.includes(newKeyword)) {
      setCustomKeywords([...customKeywords, newKeyword]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setCustomKeywords(customKeywords.filter(k => k !== keyword));
  };

  return (
    <motion.div 
      className="absolute top-0 left-0 right-0 bottom-0 bg-white z-50"
      initial={{ y: '100%' }}
      animate={{ y: isExploreOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <h2 className="text-xl font-semibold font-display">Style Explorer</h2>
          <button className="p-1" onClick={handleCloseExplore}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {styleProfile ? (
            <>
              <h3 className="font-display text-lg font-semibold mb-3">Current Style Profile</h3>
              
              <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <span className="text-sm text-neutral-500">Style Code</span>
                    <p className="font-medium">{styleProfile.styleCode}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">Primary Category</span>
                    <p className="font-medium">{styleProfile.primaryCategory}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">Color Palette</span>
                    <div className="flex mt-1 space-x-1">
                      {styleProfile.colorPalette.map((color, index) => (
                        <div 
                          key={index}
                          className="w-5 h-5 rounded-full border border-neutral-200"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">Perspective</span>
                    <p className="font-medium">{styleProfile.perspective}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-neutral-500">Key Descriptors</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {styleProfile.keyDescriptors.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-white rounded-full text-xs text-neutral-600 border border-neutral-200">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <h3 className="font-display text-lg font-semibold mb-3">Customize Style</h3>
              
              <div className="mb-5">
                <label className="text-sm font-medium text-neutral-700 mb-1 block">Color Direction</label>
                <div className="grid grid-cols-5 gap-2">
                  <div 
                    className={`aspect-square rounded-lg bg-gradient-to-r from-white to-neutral-100 flex items-center justify-center ${colorDirection === 'neutral' ? 'border-2 border-primary' : ''}`}
                    onClick={() => setColorDirection('neutral')}
                  >
                    {colorDirection === 'neutral' && <span className="material-icons text-primary">check</span>}
                  </div>
                  <div 
                    className={`aspect-square rounded-lg bg-gradient-to-r from-neutral-800 to-neutral-900 flex items-center justify-center ${colorDirection === 'dark' ? 'border-2 border-primary' : ''}`}
                    onClick={() => setColorDirection('dark')}
                  >
                    {colorDirection === 'dark' && <span className="material-icons text-primary">check</span>}
                  </div>
                  <div 
                    className={`aspect-square rounded-lg bg-gradient-to-r from-primary to-secondary opacity-${colorDirection === 'colorful' ? '100' : '60'} flex items-center justify-center ${colorDirection === 'colorful' ? 'border-2 border-primary' : ''}`}
                    onClick={() => setColorDirection('colorful')}
                  >
                    {colorDirection === 'colorful' && <span className="material-icons text-white">check</span>}
                  </div>
                  <div 
                    className={`aspect-square rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 opacity-${colorDirection === 'natural' ? '100' : '60'} flex items-center justify-center ${colorDirection === 'natural' ? 'border-2 border-primary' : ''}`}
                    onClick={() => setColorDirection('natural')}
                  >
                    {colorDirection === 'natural' && <span className="material-icons text-white">check</span>}
                  </div>
                  <div 
                    className={`aspect-square rounded-lg bg-gradient-to-r from-amber-400 to-red-500 opacity-${colorDirection === 'warm' ? '100' : '60'} flex items-center justify-center ${colorDirection === 'warm' ? 'border-2 border-primary' : ''}`}
                    onClick={() => setColorDirection('warm')}
                  >
                    {colorDirection === 'warm' && <span className="material-icons text-white">check</span>}
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <label className="text-sm font-medium text-neutral-700 mb-1 block">Lighting Style</label>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {['Natural', 'Studio', 'Dramatic', 'Soft'].map((style) => (
                    <div 
                      key={style}
                      className={`px-4 py-2 bg-white ${lightingStyle === style ? 'border-2 border-primary text-neutral-900' : 'border border-neutral-200 text-neutral-600'} rounded-lg text-sm font-medium flex-shrink-0`}
                      onClick={() => setLightingStyle(style)}
                    >
                      {style}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-5">
                <label className="text-sm font-medium text-neutral-700 mb-1 block">Texture Amount</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={textureAmount} 
                  onChange={(e) => setTextureAmount(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>Minimal</span>
                  <span>Balanced</span>
                  <span>Heavy</span>
                </div>
              </div>
              
              <div className="mb-5">
                <label className="text-sm font-medium text-neutral-700 mb-1 block">Custom Keywords</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter style keywords" 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 material-icons text-neutral-400"
                    onClick={handleAddKeyword}
                  >
                    add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {customKeywords.map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-white rounded-full text-xs text-neutral-600 border border-neutral-200 flex items-center">
                      {keyword}
                      <button 
                        className="material-icons text-xs ml-1 text-neutral-400"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        close
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Empty state when no styles selected yet
            <div className="flex flex-col items-center justify-center h-full py-10">
              <div className="bg-neutral-50 p-6 rounded-xl mb-4">
                <span className="material-icons text-4xl text-neutral-400">style</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Style Profile Yet</h3>
              <p className="text-neutral-500 text-center max-w-xs">
                Select some styles using the swipe interface to generate your style profile.
              </p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-neutral-100">
          <button 
            className="w-full py-3 bg-primary rounded-xl text-white font-medium font-display"
            onClick={handleApplyChanges}
            disabled={!styleProfile}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExploreModal;
