import React, { createContext, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";

// Create context
export const UiContext = createContext();

// Initial state
const initialState = {
  alerts: [],
  loading: false,
};

// Reducer
const uiReducer = (state, action) => {
  switch (action.type) {
    case "SET_ALERT":
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    case "REMOVE_ALERT":
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const UiProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Set alert
  const setAlert = (message, type = "info", timeout = 5000) => {
    const id = uuidv4();

    dispatch({
      type: "SET_ALERT",
      payload: { id, message, type },
    });

    setTimeout(() => removeAlert(id), timeout);

    return id;
  };

  // Remove alert
  const removeAlert = (id) => {
    dispatch({
      type: "REMOVE_ALERT",
      payload: id,
    });
  };

  // Set loading state
  const setLoading = (isLoading) => {
    dispatch({
      type: "SET_LOADING",
      payload: isLoading,
    });
  };

  return (
    <UiContext.Provider
      value={{
        alerts: state.alerts,
        loading: state.loading,
        setAlert,
        removeAlert,
        setLoading,
      }}
    >
      {children}
    </UiContext.Provider>
  );
};

// Custom hook for using UI context
export const useUi = () => {
  const context = React.useContext(UiContext);
  if (context === undefined) {
    throw new Error("useUi must be used within a UiProvider");
  }
  return context;
};
