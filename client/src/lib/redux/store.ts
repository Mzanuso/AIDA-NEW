import { configureStore } from '@reduxjs/toolkit';
import styleReducer from './slices/styleSlice';
import navigationReducer from './slices/navigationSlice';

export const store = configureStore({
  reducer: {
    style: styleReducer,
    navigation: navigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
