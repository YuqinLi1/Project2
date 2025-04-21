import api from "./index";

// Login user
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Register user
export const register = async (formData) => {
  const response = await api.post("/auth/register", formData);
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await api.put("/auth/change-password", passwordData);
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
};
