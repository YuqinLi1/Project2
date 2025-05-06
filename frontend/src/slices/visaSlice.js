import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentState: 'initial', // one of: initial, pending1, reject1, pass1, etc.
  message: '',             // HR feedback or guidance message
  documents: {
    "OPT Receipt": null,
    "OPT EAD": null,
    "I-983": null,
    "I-20": null
  }
};

const visaSlice = createSlice({
  name: "visa",
  initialState,
  reducers: {
    setVisaState(state, action) {
      state.currentState = action.payload;
    },
    setVisaMessage(state, action) {
      state.message = action.payload;
    },
    setVisaDocuments(state, action) {
      // expects { "OPT Receipt": {...}, "OPT EAD": {...}, ... }
      state.documents = action.payload;
    },
    resetVisaState(state) {
      state.currentState = "initial";
      state.message = "";
      state.documents = {
        "OPT Receipt": null,
        "OPT EAD": null,
        "I-983": null,
        "I-20": null
      };
    }
  }
});

export const {
  setVisaState,
  setVisaMessage,
  setVisaDocuments,
  resetVisaState
} = visaSlice.actions;

export default visaSlice.reducer;