import { configureStore } from "@reduxjs/toolkit";
import applicationReducer from "./slices/applicationSlice"; // adjust path if needed

const store = configureStore({
  reducer: {
    application: applicationReducer,
    // add other slices like visa, information if needed
  },
});

export default store; 