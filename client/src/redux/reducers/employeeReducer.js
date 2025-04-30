import {
  FETCH_PROFILE_REQUEST,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_FAIL,
  ONBOARDING_SUBMIT_REQUEST,
  ONBOARDING_SUBMIT_SUCCESS,
  ONBOARDING_SUBMIT_FAIL,
  UPLOAD_DOCUMENT_REQUEST,
  UPLOAD_DOCUMENT_SUCCESS,
  UPLOAD_DOCUMENT_FAIL,
} from "../types";

const initialState = {
  onboardingApplication: null,
  loading: false,
  submitting: false,
  uploadLoading: false,
  error: null,
  submitError: null,
  employeeInfo: null,
  profileLoading: false,
  profileError: null,
};

const employmentReducer = (state = initialState, action) => {
  switch (action.type) {
    // Onboarding Application Submission
    case ONBOARDING_SUBMIT_REQUEST:
      return {
        ...state,
        submitting: true,
        submitError: null,
      };
    case ONBOARDING_SUBMIT_SUCCESS:
      return {
        ...state,
        submitting: false,
        onboardingApplication: action.payload,
        submitError: null,
      };
    case ONBOARDING_SUBMIT_FAIL:
      return {
        ...state,
        submitting: false,
        submitError: action.payload,
      };

    // Document Upload
    case UPLOAD_DOCUMENT_REQUEST:
      return {
        ...state,
        uploadLoading: true,
        error: null,
      };
    case UPLOAD_DOCUMENT_SUCCESS:
      return {
        ...state,
        uploadLoading: false,
        onboardingApplication: {
          ...state.onboardingApplication,
          documents: {
            ...(state.onboardingApplication?.documents || {}),
            [action.payload.documentType]: action.payload,
          },
        },
      };
    case UPLOAD_DOCUMENT_FAIL:
      return {
        ...state,
        uploadLoading: false,
        error: action.payload,
      };

    // Profile Fetching
    case FETCH_PROFILE_REQUEST:
      return {
        ...state,
        profileLoading: true,
        profileError: null,
      };
    case FETCH_PROFILE_SUCCESS:
      return {
        ...state,
        profileLoading: false,
        employeeInfo: action.payload,
        onboardingApplication: action.payload.onboardingApplication || null,
        profileError: null,
      };
    case FETCH_PROFILE_FAIL:
      return {
        ...state,
        profileLoading: false,
        profileError: action.payload,
      };

    // Default case
    default:
      return state;
  }
};

export default employmentReducer;
