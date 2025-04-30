import { configureStore } from '@reduxjs/toolkit';
import applicationReducer from './slices/applicationSlice';
import informationReducer from './slices/informationSlice';


const store = configureStore({
  reducer: {
    application: applicationReducer,
    information: informationReducer,
  }
});

export default store;