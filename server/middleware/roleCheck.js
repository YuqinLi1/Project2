const Employee = require("./models/Employee");
const { asyncHandler } = require("../utils/errorHandler");

const checkOwnership = asyncHandler(async (req, res, next) => {
  // Get the requested resource ID from params
  const resourceId = req.params.id;

  // Get the employee associated with the current user
  const employee = await Employee.findOne({ userId: req.user.id });

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "Employee profile not found",
    });
  }

  // If user is not HR and trying to access someone else's resource
  if (req.user.role !== "hr" && employee._id.toString() !== resourceId) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this resource",
    });
  }

  // Add employee to request object
  req.employee = employee;
  next();
});

const checkOnboardingStatus = asyncHandler(async (req, res, next) => {
  // Get the employee associated with the current user
  const employee = await Employee.findOne({ userId: req.user.id });

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "Employee profile not found",
    });
  }

  // If employee has not completed onboarding
  if (employee.onboardingStatus !== "approved") {
    return res.status(403).json({
      success: false,
      message: "Please complete the onboarding process first",
      onboardingStatus: employee.onboardingStatus,
    });
  }

  next();
});

const checkVisaStatus = asyncHandler(async (req, res, next) => {
  // Skip check for HR users
  if (req.user.role === "hr") {
    return next();
  }

  // Get the employee associated with the current user
  const employee = await Employee.findOne({ userId: req.user.id });

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "Employee profile not found",
    });
  }

  // If employee has permanent residency or citizenship, no visa check needed
  if (employee.isPermanentResident) {
    return next();
  }

  // Otherwise, check if route is visa-related
  const isVisaRoute = req.originalUrl.includes("/visa-status");

  // For non-visa routes when employee needs visa management
  if (!isVisaRoute && !employee.isPermanentResident) {
    return res.status(403).json({
      success: false,
      message: "Please complete your visa status management",
      redirectTo: "/visa-status",
    });
  }

  next();
});

module.exports = {
  checkOwnership,
  checkOnboardingStatus,
  checkVisaStatus,
};
