import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentState: 'initial', // one of: initial, pending1–4, reject1–4, pass1–4
  message: '',             // user-facing message from backend
};

const visaSlice = createSlice({
  name: 'visa',
  initialState,
  reducers: {
    setVisaState: (state, action) => {
      state.currentState = action.payload;
    },
    setVisaMessage: (state, action) => {
      state.message = action.payload;
    }
  },
});

export const { setVisaState, setVisaMessage } = visaSlice.actions;
export default visaSlice.reducer;