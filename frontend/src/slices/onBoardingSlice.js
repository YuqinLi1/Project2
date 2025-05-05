import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: '', // never submit, rejected, pending
  rejectReason: '',
  formData: {
    // Personal Info
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    ssn: '',
    gender: '',

    // Reference
    referenceFirstName: '',
    referenceMiddleName: '',
    referenceLastName: '',
    referencePhone: '',
    referenceEmail: '',
    referenceRelationship: '',

    // Emergency
    emergencyFirstName: '',
    emergencyMiddleName: '',
    emergencyLastName: '',
    emergencyPhone: '',
    emergencyEmail: '',
    emergencyRelationship: '',

    // Visa
    isPermanentResident: '',
    greenCardStatus: '',
    visaType: '',
    otherVisaTitle: '',
    visaStartDate: '',
    visaEndDate: '',

    // Other
    sameAsReference: false
  }
};

const onBoardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setRejectReason: (state, action) => {
      state.rejectReason = action.payload;
    },
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
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
} = onBoardingSlice.actions;

export default onBoardingSlice.reducer;