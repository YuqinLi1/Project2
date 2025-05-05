import { configureStore } from "@reduxjs/toolkit";
import onBoardingReducer from "./slices/onBoardingSlice";
import applicationReducer from "./slices/applicationSlice";
import informationReducer from "./slices/informationSlice";
import visaReducer from "./slices/visaSlice";
import profileReducer from "./slices/profileSlice";
import hiringReducer from "./slices/hiringSlice";

const store = configureStore({
  reducer: {
    application: applicationReducer,
    information: informationReducer,
    visa: visaReducer,
    profiles: profileReducer,
    hiring: hiringReducer,
    onboarding: onBoardingReducer,
  },
});

export default store;
