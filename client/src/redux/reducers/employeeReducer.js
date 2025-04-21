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
  CLEAR_ERRORS,
} from "../types";

const initialState = {
  profile: null,
  documents: [],
  visaStatus: null,
  loading: false,
  error: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case FETCH_PROFILE_REQUEST:
    case UPDATE_PROFILE_REQUEST:
    case ONBOARDING_SUBMIT_REQUEST:
    case FETCH_DOCUMENTS_REQUEST:
    case UPLOAD_DOCUMENT_REQUEST:
    case FETCH_VISA_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_PROFILE_SUCCESS:
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        profile: payload,
        loading: false,
        error: null,
      };
    case ONBOARDING_SUBMIT_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case FETCH_DOCUMENTS_SUCCESS:
      return {
        ...state,
        documents: payload,
        loading: false,
        error: null,
      };
    case UPLOAD_DOCUMENT_SUCCESS:
      return {
        ...state,
        documents: [...state.documents, payload],
        loading: false,
        error: null,
      };
    case FETCH_VISA_STATUS_SUCCESS:
      return {
        ...state,
        visaStatus: payload,
        loading: false,
        error: null,
      };
    case FETCH_PROFILE_FAIL:
    case UPDATE_PROFILE_FAIL:
    case ONBOARDING_SUBMIT_FAIL:
    case FETCH_DOCUMENTS_FAIL:
    case UPLOAD_DOCUMENT_FAIL:
    case FETCH_VISA_STATUS_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}
