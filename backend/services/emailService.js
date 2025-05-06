const nodemailer = require("nodemailer");
const { registrationEmail } = require("../utils/emailTemplates");

// Create a transporter based on environment
const createTransporter = () => {
  // For production
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  // For development - use ethereal for testing
  else {
    // For testing, you can create a test account at ethereal.email
    // or just log the email content instead of actually sending it
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user:
          process.env.ETHEREAL_EMAIL ||
          "your-ethereal-test-email@ethereal.email",
        pass: process.env.ETHEREAL_PASSWORD || "your-ethereal-test-password",
      },
    });
  }
};

const sendRegistrationEmail = async (to, name, token) => {
  const transporter = createTransporter();

  // Build registration URL
  const baseURL = process.env.CLIENT_URL || "http://localhost:3000";
  const registrationLink = `${baseURL}/register?token=${token}`;

  // Use email template
  const template = registrationEmail(name || "there", registrationLink);

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_FROM || "hr@yourdomain.com",
    to,
    subject: template.subject,
    html: template.html,
  };

  // For development, log the email instead of sending
  if (process.env.NODE_ENV !== "production") {
    console.log("======= EMAIL CONTENT (DEV MODE) =======");
    console.log(`To: ${to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log("Body:", mailOptions.html);
    console.log("Registration link:", registrationLink);
    console.log("=======================================");
    return { messageId: "dev-mode" };
  }

  // Send the email in production
  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendRegistrationEmail,
};
