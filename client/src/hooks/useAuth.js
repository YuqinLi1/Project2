import { useContext } from "react";
import { useSelector } from "react-redux";
import AuthContext from "../contexts/AuthContext";

// Custom hook to use auth data
const useAuth = () => {
  // Always call hooks at the top level
  const authContext = useContext(AuthContext);
  const authState = useSelector((state) => state.auth);

  // If auth context is available, use it
  if (authContext) {
    return authContext;
  }

  // Otherwise, fallback to Redux state
  return {
    isAuthenticated: authState?.isAuthenticated || false,
    user: authState?.user || null,
    loading: authState?.loading || false,
    error: authState?.error || null,
  };
};

export default useAuth;
