import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  registrationTokens: [],
  pendingApplications: [],
  rejectedApplications: [],
  approvedApplications: [],
  selectedApplication: null,
  feedbackText: "",
};

const hiringSlice = createSlice({
  name: "hiring",
  initialState,
  reducers: {
    addRegistrationToken: (state, action) => {
      state.registrationTokens = [action.payload, ...state.registrationTokens];
    },
    setRegistrationTokens: (state, action) => {
      state.registrationTokens = action.payload;
    },
    setPendingApplications: (state, action) => {
      state.pendingApplications = action.payload;
    },
    setRejectedApplications: (state, action) => {
      state.rejectedApplications = action.payload;
    },
    setApprovedApplications: (state, action) => {
      state.approvedApplications = action.payload;
    },
    setSelectedApplication: (state, action) => {
      state.selectedApplication = action.payload;
    },
    setFeedbackText: (state, action) => {
      state.feedbackText = action.payload;
    },
    approveApplication: (state, action) => {
      const appId = action.payload;
      const appIndex = state.pendingApplications.findIndex(
        (app) => app._id === appId
      );

      if (appIndex !== -1) {
        const app = state.pendingApplications[appIndex];
        state.approvedApplications.push(app);
        state.pendingApplications = state.pendingApplications.filter(
          (app) => app._id !== appId
        );
      }
    },
    rejectApplication: (state, action) => {
      const { id, feedback } = action.payload;
      const appIndex = state.pendingApplications.findIndex(
        (app) => app._id === id
      );

      if (appIndex !== -1) {
        const app = state.pendingApplications[appIndex];
        app.rejectReason = feedback;
        app.feedback = feedback;
        state.rejectedApplications.push(app);
        state.pendingApplications = state.pendingApplications.filter(
          (app) => app._id !== id
        );
      }
    },
  },
});

export const {
  addRegistrationToken,
  setPendingApplications,
  setRejectedApplications,
  setApprovedApplications,
  setSelectedApplication,
  setFeedbackText,
  approveApplication,
  rejectApplication,
  setRegistrationTokens,
} = hiringSlice.actions;

export default hiringSlice.reducer;
