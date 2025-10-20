import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PhaseType = 'STYLE' | 'STORY' | 'BOARD' | 'VIDEO' | 'POST';

export interface NavigationState {
  currentPhase: PhaseType;
  phaseProgress: {
    STYLE: number;
    STORY: number;
    BOARD: number;
    VIDEO: number;
    POST: number;
  };
  phasesCompleted: PhaseType[];
}

const initialState: NavigationState = {
  currentPhase: 'STYLE',
  phaseProgress: {
    STYLE: 0,
    STORY: 0,
    BOARD: 0,
    VIDEO: 0,
    POST: 0,
  },
  phasesCompleted: [],
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setCurrentPhase: (state, action: PayloadAction<PhaseType>) => {
      state.currentPhase = action.payload;
    },
    updatePhaseProgress: (state, action: PayloadAction<{ phase: PhaseType; progress: number }>) => {
      const { phase, progress } = action.payload;
      state.phaseProgress[phase] = progress;
    },
    completePhase: (state, action: PayloadAction<PhaseType>) => {
      if (!state.phasesCompleted.includes(action.payload)) {
        state.phasesCompleted.push(action.payload);
      }
      state.phaseProgress[action.payload] = 100;
    },
    resetNavigation: (state) => {
      state.currentPhase = 'STYLE';
      state.phaseProgress = {
        STYLE: 0,
        STORY: 0,
        BOARD: 0,
        VIDEO: 0,
        POST: 0,
      };
      state.phasesCompleted = [];
    },
  },
});

export const { setCurrentPhase, updatePhaseProgress, completePhase, resetNavigation } = navigationSlice.actions;

export default navigationSlice.reducer;
