import {
  FETCH_EMPLOYEES_REQUEST,
  FETCH_EMPLOYEES_SUCCESS,
  FETCH_EMPLOYEES_FAIL,
  FETCH_EMPLOYEE_DETAIL_REQUEST,
  FETCH_EMPLOYEE_DETAIL_SUCCESS,
  FETCH_EMPLOYEE_DETAIL_FAIL,
  SEARCH_EMPLOYEES_REQUEST,
  SEARCH_EMPLOYEES_SUCCESS,
  SEARCH_EMPLOYEES_FAIL,
  GENERATE_TOKEN_REQUEST,
  GENERATE_TOKEN_SUCCESS,
  GENERATE_TOKEN_FAIL,
  FETCH_TOKENS_REQUEST,
  FETCH_TOKENS_SUCCESS,
  FETCH_TOKENS_FAIL,
  FETCH_APPLICATIONS_REQUEST,
  FETCH_APPLICATIONS_SUCCESS,
  FETCH_APPLICATIONS_FAIL,
  REVIEW_APPLICATION_REQUEST,
  REVIEW_APPLICATION_SUCCESS,
  REVIEW_APPLICATION_FAIL,
  REVIEW_DOCUMENT_REQUEST,
  REVIEW_DOCUMENT_SUCCESS,
  REVIEW_DOCUMENT_FAIL,
  FETCH_VISA_MANAGEMENT_REQUEST,
  FETCH_VISA_MANAGEMENT_SUCCESS,
  FETCH_VISA_MANAGEMENT_FAIL,
  SEND_NOTIFICATION_REQUEST,
  SEND_NOTIFICATION_SUCCESS,
  SEND_NOTIFICATION_FAIL,
  CLEAR_ERRORS,
} from "../types";

const initialState = {
  employees: [],
  searchResults: [],
  selectedEmployee: null,
  tokenHistory: [],
  applications: [],
  visaManagement: [],
  loading: false,
  error: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case FETCH_EMPLOYEES_REQUEST:
    case FETCH_EMPLOYEE_DETAIL_REQUEST:
    case SEARCH_EMPLOYEES_REQUEST:
    case GENERATE_TOKEN_REQUEST:
    case FETCH_TOKENS_REQUEST:
    case FETCH_APPLICATIONS_REQUEST:
    case REVIEW_APPLICATION_REQUEST:
    case REVIEW_DOCUMENT_REQUEST:
    case FETCH_VISA_MANAGEMENT_REQUEST:
    case SEND_NOTIFICATION_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_EMPLOYEES_SUCCESS:
      return {
        ...state,
        employees: payload,
        loading: false,
        error: null,
      };
    case FETCH_EMPLOYEE_DETAIL_SUCCESS:
      return {
        ...state,
        selectedEmployee: payload,
        loading: false,
        error: null,
      };
    case SEARCH_EMPLOYEES_SUCCESS:
      return {
        ...state,
        searchResults: payload,
        loading: false,
        error: null,
      };
    case GENERATE_TOKEN_SUCCESS:
      return {
        ...state,
        tokenHistory: [payload, ...state.tokenHistory],
        loading: false,
        error: null,
      };
    case FETCH_TOKENS_SUCCESS:
      return {
        ...state,
        tokenHistory: payload,
        loading: false,
        error: null,
      };
    case FETCH_APPLICATIONS_SUCCESS:
      return {
        ...state,
        applications: payload,
        loading: false,
        error: null,
      };
    case REVIEW_APPLICATION_SUCCESS:
      return {
        ...state,
        applications: state.applications.map((app) =>
          app._id === payload._id ? payload : app
        ),
        loading: false,
        error: null,
      };
    case REVIEW_DOCUMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case FETCH_VISA_MANAGEMENT_SUCCESS:
      return {
        ...state,
        visaManagement: payload,
        loading: false,
        error: null,
      };
    case SEND_NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case FETCH_EMPLOYEES_FAIL:
    case FETCH_EMPLOYEE_DETAIL_FAIL:
    case SEARCH_EMPLOYEES_FAIL:
    case GENERATE_TOKEN_FAIL:
    case FETCH_TOKENS_FAIL:
    case FETCH_APPLICATIONS_FAIL:
    case REVIEW_APPLICATION_FAIL:
    case REVIEW_DOCUMENT_FAIL:
    case FETCH_VISA_MANAGEMENT_FAIL:
    case SEND_NOTIFICATION_FAIL:
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
