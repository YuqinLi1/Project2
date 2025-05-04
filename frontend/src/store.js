import { configureStore } from '@reduxjs/toolkit';
import onBoardingReducer from './slices/onBoardingSlice';
import informationReducer from './slices/informationSlice';


const store = configureStore({
  reducer: {
    onBoarding: onBoardingReducer,
    information: informationReducer,
  }
});

export default store;