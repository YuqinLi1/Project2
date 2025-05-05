const registrationEmail = (name, registrationLink) => {
  return {
    subject: "Welcome to Our Company - Registration Link",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Our Company!</h2>
          <p>Dear ${name},</p>
          <p>We're excited to have you join our team! To complete your registration, please click the link below:</p>
          <p style="text-align: center;">
            <a href="${registrationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
              Complete Registration
            </a>
          </p>
          <p><strong>Note:</strong> This link will expire in 3 hours.</p>
          <p>If you have any questions, please contact HR.</p>
          <p>Best regards,<br>HR Department</p>
        </div>
      `,
  };
};

const visaDocumentNotification = (name, documentType) => {
  return {
    subject: `Action Required: Upload ${documentType}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Document Upload Required</h2>
          <p>Dear ${name},</p>
          <p>Your previous document has been approved. The next step in your visa process is to upload your <strong>${documentType}</strong>.</p>
          <p>Please log in to your employee portal and navigate to the Visa Status Management page to complete this step.</p>
          <p>If you have any questions, please contact HR.</p>
          <p>Best regards,<br>HR Department</p>
        </div>
      `,
  };
};

const documentFeedbackEmail = (name, documentType, feedback) => {
  return {
    subject: `Feedback on Your ${documentType} Submission`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Document Feedback</h2>
          <p>Dear ${name},</p>
          <p>We've reviewed your ${documentType} submission and have the following feedback:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin: 10px 0;">
            ${feedback}
          </div>
          <p>Please log in to your employee portal to review the feedback and resubmit your document.</p>
          <p>Best regards,<br>HR Department</p>
        </div>
      `,
  };
};

module.exports = {
  registrationEmail,
  visaDocumentNotification,
  documentFeedbackEmail,
};
