import { SET_ALERT, REMOVE_ALERT } from "../types";

const initialState = {
  alerts: [],
  activeMenuItem: "dashboard", // Default active menu item
};

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ALERT:
      // Handle alert and activeMenuItem if provided
      if (action.payload && action.payload.activeMenuItem) {
        return {
          ...state,
          alerts: [...state.alerts, action.payload],
          activeMenuItem: action.payload.activeMenuItem,
        };
      }
      // Handle just the alert if no activeMenuItem is provided
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    case REMOVE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
    default:
      return state;
  }
};

export default uiReducer;
