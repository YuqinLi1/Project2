// services/emailService.js
const nodemailer = require("nodemailer");
const { registrationEmail } = require("../utils/emailTemplates");

// Function to create a test account and transporter
const createEtherealTransport = async () => {
  // Create a test account on ethereal.email
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter using the test account
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return { transporter, testAccount };
};

const sendRegistrationEmail = async (to, name, token) => {
  try {
    // Build registration URL
    const baseURL = process.env.CLIENT_URL || "http://localhost:3000";
    const registrationLink = `${baseURL}/register?token=${token}`;

    // Use your email template
    const template = registrationEmail(name || "there", registrationLink);

    // Create a test account and transporter
    const { transporter, testAccount } = await createEtherealTransport();

    // Email content
    const mailOptions = {
      from: `"HR Department" <${testAccount.user}>`, // sender address
      to: to, // list of receivers
      subject: template.subject,
      html: template.html,
    };

    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);

    // Preview URL - this is an actual URL you can visit to see the email
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendVisaDocumentNotification = async (email, name, currentStep) => {
  // Determine what document is needed next
  let documentNeeded = "";

  switch (currentStep) {
    case "OPT Receipt":
      documentNeeded = "OPT EAD card";
      break;
    case "OPT EAD":
      documentNeeded = "I-983 form";
      break;
    case "I-983":
      documentNeeded = "I-20 document";
      break;
    case "I-20":
      documentNeeded = "final visa documents";
      break;
    default:
      documentNeeded = "required visa documents";
  }

  // Create email content
  const subject = `Action Required: Upload ${documentNeeded} for Visa Processing`;

  const message = `
  Dear ${name},
  
  This is a reminder that you need to upload your ${documentNeeded} for your visa process to continue.
  
  Please log in to the employee portal and submit this document as soon as possible to avoid any delays in your visa processing.
  
  Thank you,
  HR Department
  `;

  // Send the email
  return await sendEmail(email, subject, message);
};

const sendEmail = async (to, subject, text, html) => {
  try {
    // Create a test account and transporter
    const { transporter, testAccount } = await createEtherealTransport();

    // Email content
    const mailOptions = {
      from: `"HR Department" <${testAccount.user}>`, // sender address
      to: to, // list of receivers
      subject: subject,
      text: text,
      html: html || undefined,
    };

    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);

    // Preview URL - this is an actual URL you can visit to see the email
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendRegistrationEmail,
  sendVisaDocumentNotification,
  sendEmail,
};
