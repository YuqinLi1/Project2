const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const isValidSSN = (ssn) => {
  const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
  return ssnRegex.test(ssn);
};

const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(phoneNumber);
};

const isValidZipCode = (zipCode) => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

const isValidDate = (dateString) => {
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

  // Parse the date parts and create a date object
  const parts = dateString.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  // Create a date object and check if it's valid
  const date = new Date(year, month, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};

const sanitizeText = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

module.exports = {
  isValidEmail,
  isValidSSN,
  isValidPhoneNumber,
  isValidZipCode,
  isValidDate,
  sanitizeText,
};
