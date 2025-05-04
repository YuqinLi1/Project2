import moment from "moment";

export const formatDate = (date) => {
  if (!date) return "";
  return moment(date).format("MM/DD/YYYY");
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Strip all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if the number has the correct length
  if (cleaned.length !== 10) {
    return phone; // Return original if not valid
  }

  // Format as (XXX) XXX-XXXX
  return `(${cleaned.substring(0, 3)}) ${cleaned.substring(
    3,
    6
  )}-${cleaned.substring(6, 10)}`;
};

export const formatSSN = (ssn, mask = true) => {
  if (!ssn) return "";

  // Strip all non-numeric characters
  const cleaned = ssn.replace(/\D/g, "");

  // Check if the number has the correct length
  if (cleaned.length !== 9) {
    return ssn; // Return original if not valid
  }

  if (mask) {
    // Format as XXX-XX-****
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 5)}-****`;
  }

  // Format as XXX-XX-XXXX
  return `${cleaned.substring(0, 3)}-${cleaned.substring(
    3,
    5
  )}-${cleaned.substring(5, 9)}`;
};

export const capitalize = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatName = (firstName, lastName, middleName) => {
  const middle = middleName ? ` ${middleName}` : "";
  return `${lastName}, ${firstName}${middle}`;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
