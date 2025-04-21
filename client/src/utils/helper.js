export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const generateId = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === "function" ? key(item) : item[key];

    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    result[groupKey].push(item);
    return result;
  }, {});
};

export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return "";

  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";

  return `${first}${last}`;
};

export const sortBy = (array, key, order = "asc") => {
  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA < valueB) {
      return order === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  });
};
