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

module.exports = {
  sendRegistrationEmail,
};
