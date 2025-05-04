import { configureStore } from '@reduxjs/toolkit';
import onBoardingReducer from './slices/onBoardingSlice';


const store = configureStore({
  reducer: {
    onboarding: onBoardingReducer,
  }
});

export default store;