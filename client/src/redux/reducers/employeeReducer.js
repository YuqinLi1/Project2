import {
  FETCH_PROFILE_REQUEST,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_FAIL,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  ONBOARDING_SUBMIT_REQUEST,
  ONBOARDING_SUBMIT_SUCCESS,
  ONBOARDING_SUBMIT_FAIL,
  FETCH_DOCUMENTS_REQUEST,
  FETCH_DOCUMENTS_SUCCESS,
  FETCH_DOCUMENTS_FAIL,
  UPLOAD_DOCUMENT_REQUEST,
  UPLOAD_DOCUMENT_SUCCESS,
  UPLOAD_DOCUMENT_FAIL,
  FETCH_VISA_STATUS_REQUEST,
  FETCH_VISA_STATUS_SUCCESS,
  FETCH_VISA_STATUS_FAIL,
} from "../types";

const initialState = {
  employeeInfo: null,
  onboardingApplication: null,
  documents: [],
  visaStatus: null,
  onboardingStatus: null, // 'Not Started', 'Pending', 'Approved', 'Rejected'
  loading: false,
  updateLoading: false,
  uploadLoading: false,
  downloadLoading: false,
  previewLoading: false,
  submitting: false,
  error: null,
  updateError: null,
  uploadError: null,
  submitError: null,
};

const employmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        employeeInfo: action.payload,
        // Extract onboarding status from profile if available
        onboardingStatus:
          action.payload?.onboardingStatus || state.onboardingStatus,
        error: null,
      };
    case FETCH_PROFILE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        updateLoading: true,
        updateError: null,
      };
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        employeeInfo: action.payload,
        updateLoading: false,
        updateError: null,
      };
    case UPDATE_PROFILE_FAIL:
      return {
        ...state,
        updateLoading: false,
        updateError: action.payload,
      };

    case ONBOARDING_SUBMIT_REQUEST:
      return {
        ...state,
        submitting: true,
        submitError: null,
      };
    case ONBOARDING_SUBMIT_SUCCESS:
      return {
        ...state,
        onboardingApplication: action.payload,
        onboardingStatus: "Pending", // Update status after submission
        submitting: false,
        submitError: null,
      };
    case ONBOARDING_SUBMIT_FAIL:
      return {
        ...state,
        submitting: false,
        submitError: action.payload,
      };

    case FETCH_DOCUMENTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_DOCUMENTS_SUCCESS:
      return {
        ...state,
        documents: action.payload,
        loading: false,
        error: null,
      };
    case FETCH_DOCUMENTS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPLOAD_DOCUMENT_REQUEST:
      return {
        ...state,
        uploadLoading: true,
        uploadError: null,
      };
    case UPLOAD_DOCUMENT_SUCCESS:
      return {
        ...state,
        // Add the new document or update existing documents
        documents: state.documents.find((d) => d.id === action.payload.id)
          ? state.documents.map((doc) =>
              doc.id === action.payload.id ? action.payload : doc
            )
          : [...state.documents, action.payload],
        uploadLoading: false,
        uploadError: null,
      };
    case UPLOAD_DOCUMENT_FAIL:
      return {
        ...state,
        uploadLoading: false,
        uploadError: action.payload,
      };

    case FETCH_VISA_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_VISA_STATUS_SUCCESS:
      return {
        ...state,
        visaStatus: action.payload,
        loading: false,
        error: null,
      };
    case FETCH_VISA_STATUS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default employmentReducer;
