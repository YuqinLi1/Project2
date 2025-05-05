import { configureStore } from "@reduxjs/toolkit";
import onBoardingReducer from './slices/onBoardingSlice';
import personalProfileReducer from './slices/personalProfileSlice';
import visaReducer from "./slices/visaSlice";
import profileReducer from "./slices/profileSlice";
import hiringReducer from "./slices/hiringSlice";

const store = configureStore({
  reducer: {
    onboarding: onBoardingReducer,
    personalProfile: personalProfileReducer,
    visa: visaReducer,
    profiles: profileReducer,
    hiring: hiringReducer,
  },
});

export default store;