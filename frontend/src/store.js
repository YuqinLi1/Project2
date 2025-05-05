import { configureStore } from '@reduxjs/toolkit';
import onBoardingReducer from './slices/onBoardingSlice';
import personalProfileReducer from './slices/personalProfileSlice';


const store = configureStore({
  reducer: {
    onboarding: onBoardingReducer,
    personalProfile: personalProfileReducer,
  }
});

export default store;