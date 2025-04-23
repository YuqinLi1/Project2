import { configureStore } from '@reduxjs/toolkit';
import applicationReducer from './applicationSlice';
import visaReducer from './visaSlice';

const store = configureStore({
  reducer: {
    application: applicationReducer,
    visa: visaReducer
  },
});

export default store;