import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { StyleReference } from '@shared/schema';

// Extended type for UI layer with additional style metadata
export interface UIStyleReference extends StyleReference {
  dominantColors?: string[];
  keywords?: string[];
  category?: string;
  perspective?: string;
  lighting?: string;
  textureAmount?: number;
  customKeywords?: string[];
}

export interface StyleState {
  currentStyleIndex: number;
  availableStyles: UIStyleReference[];
  selectedStyles: UIStyleReference[];
  styleProgress: number;
  totalStyleQuestions: number;
  isExploreOpen: boolean;
  styleProfile: {
    styleCode: string;
    primaryCategory: string;
    colorPalette: string[];
    perspective: string;
    keyDescriptors: string[];
    colorDirection: string;
    lightingStyle: string;
    textureAmount: number;
    customKeywords: string[];
  } | null;
}

const initialState: StyleState = {
  currentStyleIndex: 0,
  availableStyles: [
    {
      id: 1,
      code: 'SREF-M42',
      name: 'Minimalist',
      description: 'Clean lines, minimal elements, and lots of white space create a modern, elegant aesthetic.',
      imageUrl: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d',
      tags: ['clean', 'spacious', 'modern', 'elegant'],
      analysisData: {},
      createdAt: null,
      updatedAt: null,
      dominantColors: ['#FFFFFF', '#F5F5F5', '#EEEEEE'],
      keywords: ['clean', 'spacious', 'modern', 'elegant'],
      category: 'Minimalist',
      perspective: 'Straight-on',
      lighting: 'Natural',
      textureAmount: 30,
      customKeywords: ['geometric', 'composition'],
    },
    {
      id: 2,
      code: 'SREF-U78',
      name: 'Urban',
      description: 'Vibrant street art with bold colors and dynamic compositions capturing city energy.',
      imageUrl: 'https://images.unsplash.com/photo-1579541591970-e5cf87294036',
      tags: ['vibrant', 'gritty', 'dynamic', 'street'],
      analysisData: {},
      createdAt: null,
      updatedAt: null,
      dominantColors: ['#FF4500', '#4B0082', '#FFFF00'],
      keywords: ['vibrant', 'gritty', 'dynamic', 'street'],
      category: 'Urban',
      perspective: 'Wide-angle',
      lighting: 'Dramatic',
      textureAmount: 70,
      customKeywords: ['graffiti', 'cityscape'],
    },
    {
      id: 3,
      code: 'SREF-N23',
      name: 'Natural',
      description: 'Organic forms and earthy tones create a peaceful, harmonious connection with nature.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      tags: ['organic', 'earthy', 'peaceful', 'harmonious'],
      analysisData: {},
      createdAt: null,
      updatedAt: null,
      dominantColors: ['#8B4513', '#556B2F', '#F5DEB3'],
      keywords: ['organic', 'earthy', 'peaceful', 'harmonious'],
      category: 'Natural',
      perspective: 'Detail',
      lighting: 'Soft',
      textureAmount: 60,
      customKeywords: ['botanical', 'organic'],
    },
  ],
  selectedStyles: [],
  styleProgress: 0,
  totalStyleQuestions: 10,
  isExploreOpen: false,
  styleProfile: null,
};

export const styleSlice = createSlice({
  name: 'style',
  initialState,
  reducers: {
    likeStyle: (state) => {
      if (state.currentStyleIndex < state.availableStyles.length) {
        const currentStyle = state.availableStyles[state.currentStyleIndex];
        state.selectedStyles.push(currentStyle);
        state.styleProgress += 1;
        state.currentStyleIndex += 1;
      }
    },
    dislikeStyle: (state) => {
      state.currentStyleIndex += 1;
      state.styleProgress += 1;
    },
    skipQuestion: (state) => {
      // Move the current style to the end of the queue
      if (state.currentStyleIndex < state.availableStyles.length) {
        const currentStyle = state.availableStyles[state.currentStyleIndex];
        state.availableStyles = [
          ...state.availableStyles.slice(0, state.currentStyleIndex),
          ...state.availableStyles.slice(state.currentStyleIndex + 1),
          currentStyle
        ];
      }
    },
    setExploreOpen: (state, action: PayloadAction<boolean>) => {
      state.isExploreOpen = action.payload;
    },
    updateStyleProfile: (state, action: PayloadAction<Partial<StyleState['styleProfile']>>) => {
      state.styleProfile = {
        ...state.styleProfile!,
        ...action.payload
      };
    },
    generateStyleProfile: (state) => {
      // This would normally calculate a profile based on selected styles
      // For now, we'll set a default one based on the first selected style
      if (state.selectedStyles.length > 0) {
        const mainStyle = state.selectedStyles[0];
        state.styleProfile = {
          styleCode: mainStyle.code,
          primaryCategory: mainStyle.category || 'Unknown',
          colorPalette: mainStyle.dominantColors || [],
          perspective: mainStyle.perspective || 'Straight-on',
          keyDescriptors: mainStyle.keywords || [],
          colorDirection: 'neutral',
          lightingStyle: mainStyle.lighting || 'Natural',
          textureAmount: mainStyle.textureAmount || 30,
          customKeywords: mainStyle.customKeywords || [],
        };
      }
    },
    resetStyleProcess: (state) => {
      state.currentStyleIndex = 0;
      state.selectedStyles = [];
      state.styleProgress = 0;
      state.styleProfile = null;
    }
  },
});

export const { 
  likeStyle, 
  dislikeStyle, 
  skipQuestion, 
  setExploreOpen, 
  updateStyleProfile,
  generateStyleProfile,
  resetStyleProcess
} = styleSlice.actions;

export default styleSlice.reducer;
