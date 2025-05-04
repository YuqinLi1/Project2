const Employee = require("../models/Employee");
const User = require("../models/User");
const Application = require("../models/Application");
const VisaStatus = require("../models/VisaStatus");

const createEmployee = async (employeeData, userId) => {
  // Check if employee already exists for this user
  const existingEmployee = await Employee.findOne({ userId });

  if (existingEmployee) {
    throw new Error("Employee profile already exists for this user");
  }

  // Create employee
  const employee = await Employee.create({
    ...employeeData,
    userId,
  });

  return employee;
};

const getEmployeeById = async (employeeId) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

const getEmployeeByUserId = async (userId) => {
  const employee = await Employee.findOne({ userId });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

const updateEmployee = async (employeeId, updateData) => {
  const employee = await Employee.findByIdAndUpdate(employeeId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

const getAllEmployees = async (filters = {}) => {
  return await Employee.find(filters).sort({ lastName: 1, firstName: 1 });
};

const searchEmployees = async (searchTerm) => {
  if (!searchTerm) {
    return [];
  }

  // Create case-insensitive regex
  const searchRegex = new RegExp(searchTerm, "i");

  return await Employee.find({
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { preferredName: searchRegex },
      { email: searchRegex },
    ],
  }).sort({ lastName: 1, firstName: 1 });
};

const submitOnboardingApplication = async (employeeId, applicationData) => {
  // Get the employee
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Update employee data
  Object.assign(employee, applicationData);
  employee.onboardingStatus = "pending";
  await employee.save();

  // Create or update application
  let application = await Application.findOne({ employeeId });

  if (!application) {
    application = new Application({
      employeeId,
      status: "pending",
    });
  } else {
    application.status = "pending";
    application.feedback = "";
    application.reviewedBy = null;
  }

  await application.save();

  // Create or update visa status if applicable
  if (!applicationData.isPermanentResident && applicationData.visaType) {
    let visaStatus = await VisaStatus.findOne({ employeeId });

    if (!visaStatus) {
      visaStatus = new VisaStatus({
        employeeId,
        isPermanentResident: applicationData.isPermanentResident,
        visaType: applicationData.visaType,
        visaTitle: applicationData.visaTitle,
        startDate: applicationData.startDate,
        endDate: applicationData.endDate,
        currentStep:
          applicationData.visaType === "F1(CPT/OPT)" ? "OPT Receipt" : null,
        documents: [],
      });
    } else {
      visaStatus.isPermanentResident = applicationData.isPermanentResident;
      visaStatus.visaType = applicationData.visaType;
      visaStatus.visaTitle = applicationData.visaTitle;
      visaStatus.startDate = applicationData.startDate;
      visaStatus.endDate = applicationData.endDate;

      if (
        applicationData.visaType === "F1(CPT/OPT)" &&
        visaStatus.currentStep === null
      ) {
        visaStatus.currentStep = "OPT Receipt";
      }
    }

    await visaStatus.save();
  }

  return application;
};

const reviewOnboardingApplication = async (
  applicationId,
  status,
  feedback,
  reviewerId
) => {
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new Error("Application not found");
  }

  // Update application
  application.status = status;
  application.feedback = feedback || "";
  application.reviewedBy = reviewerId;
  await application.save();

  // Update employee status
  const employee = await Employee.findById(application.employeeId);

  if (employee) {
    employee.onboardingStatus = status;
    employee.onboardingFeedback = feedback || "";
    await employee.save();
  }

  return application;
};

module.exports = {
  createEmployee,
  getEmployeeById,
  getEmployeeByUserId,
  updateEmployee,
  getAllEmployees,
  searchEmployees,
  submitOnboardingApplication,
  reviewOnboardingApplication,
};
