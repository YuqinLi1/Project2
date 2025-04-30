import { configureStore } from '@reduxjs/toolkit';
import applicationReducer from './applicationSlice';
import visaReducer from './visaSlice';
import informationReducer from './informationSlice';

console.log("✅ Store setup with reducers");

const store = configureStore({
  reducer: {
    application: applicationReducer,
    visa: visaReducer,
    information: informationReducer,
  }
});

export default store;