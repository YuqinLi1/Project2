const nodemailer = require("nodemailer");
const emailTemplates = require("../utils/emailTemplates");
const { asyncHandler } = require("../utils/errorHandler");

// Create transporter
let transporter;

// Initialize email transporter based on environment
if (process.env.NODE_ENV === "production") {
  // Production configuration (e.g., SMTP service)
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else {
  // Development configuration (using Ethereal for testing)
  // This will log email content to console instead of sending
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL || "ethereal.user@ethereal.email",
      pass: process.env.ETHEREAL_PASSWORD || "ethereal_password",
    },
  });
}

const sendEmail = async (to, subject, html, text = "") => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "HR Department <hr@yourcompany.com>",
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== "production") {
      console.log("Email Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendRegistrationEmail = async (email, name, token) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const registrationLink = `${baseUrl}/register?token=${token}`;

  const { subject, html } = emailTemplates.registrationEmail(
    name,
    registrationLink
  );

  return sendEmail(email, subject, html);
};

const sendVisaDocumentNotification = async (email, name, documentType) => {
  const { subject, html } = emailTemplates.visaDocumentNotification(
    name,
    documentType
  );

  return sendEmail(email, subject, html);
};

const sendDocumentFeedbackEmail = async (
  email,
  name,
  documentType,
  feedback
) => {
  const { subject, html } = emailTemplates.documentFeedbackEmail(
    name,
    documentType,
    feedback
  );

  return sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendVisaDocumentNotification,
  sendDocumentFeedbackEmail,
};
