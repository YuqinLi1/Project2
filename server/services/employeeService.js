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

const submitOnboardingApplication = async (
  employeeId,
  applicationData,
  documents = []
) => {
  // Validate application data
  if (!applicationData.personalInfo || !applicationData.visaInfo) {
    throw new Error("Incomplete application data");
  }

  // Get the employee
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Update employee data
  Object.assign(employee, {
    personalInfo: applicationData.personalInfo,
    address: applicationData.address,
    contactInfo: applicationData.contactInfo,
    emergencyContacts: applicationData.emergencyContacts,
    onboardingStatus: "pending",
  });
  await employee.save();

  // Create or update application
  let application = await Application.findOne({ employeeId });

  if (!application) {
    application = new Application({
      employeeId,
      status: "pending",
      submittedDocuments: documents.map((doc) => doc._id),
    });
  } else {
    application.status = "pending";
    application.feedback = "";
    application.reviewedBy = null;
    application.submittedDocuments = documents.map((doc) => doc._id);
  }

  await application.save();

  // Create or update visa status if applicable
  if (!applicationData.visaInfo.isUSCitizenOrPermanentResident) {
    let visaStatus = await VisaStatus.findOne({ employeeId });

    if (!visaStatus) {
      visaStatus = new VisaStatus({
        employeeId,
        isPermanentResident:
          applicationData.visaInfo.isUSCitizenOrPermanentResident,
        visaType: applicationData.visaInfo.workAuthType,
        visaTitle: applicationData.visaInfo.otherVisaType,
        startDate: applicationData.visaInfo.workAuthStartDate,
        endDate: applicationData.visaInfo.workAuthEndDate,
        currentStep:
          applicationData.visaInfo.workAuthType === "F1(CPT/OPT)"
            ? "OPT Receipt"
            : null,
        documents: documents.map((doc) => doc._id),
      });
    } else {
      visaStatus.isPermanentResident =
        applicationData.visaInfo.isUSCitizenOrPermanentResident;
      visaStatus.visaType = applicationData.visaInfo.workAuthType;
      visaStatus.visaTitle = applicationData.visaInfo.otherVisaType;
      visaStatus.startDate = applicationData.visaInfo.workAuthStartDate;
      visaStatus.endDate = applicationData.visaInfo.workAuthEndDate;

      if (
        applicationData.visaInfo.workAuthType === "F1(CPT/OPT)" &&
        visaStatus.currentStep === null
      ) {
        visaStatus.currentStep = "OPT Receipt";
      }

      // Update documents in visa status
      visaStatus.documents = documents.map((doc) => doc._id);
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
