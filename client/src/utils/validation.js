export const isValidEmail = (email) => {
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regex.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters",
    };
  }

  return { isValid: true, message: "" };
};

export const isValidSSN = (ssn) => {
  const regex = /^\d{3}-\d{2}-\d{4}$/;
  return regex.test(ssn);
};

export const isValidPhone = (phone) => {
  const regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return regex.test(phone);
};

export const isValidZip = (zip) => {
  const regex = /^\d{5}(-\d{4})?$/;
  return regex.test(zip);
};

export const validateField = (fieldName, value) => {
  if (value === undefined || value === null || value === "") {
    return "This field is required";
  }

  switch (fieldName) {
    case "email":
      return isValidEmail(value) ? null : "Please enter a valid email";
    case "phone":
    case "cellPhone":
    case "workPhone":
      return isValidPhone(value) ? null : "Please enter a valid phone number";
    case "ssn":
      return isValidSSN(value)
        ? null
        : "Please enter a valid SSN (XXX-XX-XXXX)";
    case "zip":
      return isValidZip(value) ? null : "Please enter a valid zip code";
    default:
      return null;
  }
};
