const nodemailer = require("nodemailer");

const configureEmailTransport = () => {
  let transporter;

  if (process.env.NODE_ENV === "production") {
    // Production configuration with real email service
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
    // Development configuration with Ethereal fake SMTP service
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

  // Verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error("Email service connection error:", error);
    } else {
      console.log("Email service ready");
    }
  });

  return transporter;
};

module.exports = { configureEmailTransport };
