import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: '', // Initial, Rejected, Pending, Approved
  rejectReason: '',
  formData: {}, // holds all form field values
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setRejectReason: (state, action) => {
      state.rejectReason = action.payload;
    },
    setFormData: (state, action) => {
      state.formData = action.payload;
    },
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
  },
});

export const {
  setStatus,
  setRejectReason,
  setFormData,
  updateFormField,
} = applicationSlice.actions;

export default applicationSlice.reducer;