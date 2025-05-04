export const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decodedToken = parseJwt(token);

  if (!decodedToken || !decodedToken.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  return decodedToken.exp * 1000 < Date.now();
};

export const getUserRole = (token) => {
  const decodedToken = parseJwt(token);
  return decodedToken ? decodedToken.role : null;
};

export const hasRole = (requiredRole) => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const userRole = getUserRole(token);
  return userRole === requiredRole;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  return !isTokenExpired(token);
};
