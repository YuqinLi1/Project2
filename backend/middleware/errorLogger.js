const fs = require("fs");
const path = require("path");

const errorLogger = (err, req, res, next) => {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, "../logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  // Create log entry
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const errorMessage = err.message || "Unknown error";
  const stack = err.stack || "";

  // Format log entry
  const logEntry = `
---------------------------------------
Timestamp: ${timestamp}
Method: ${method}
URL: ${url}
Error: ${errorMessage}
Stack: ${stack}
---------------------------------------
`;

  // Write to log file
  fs.appendFileSync(path.join(logsDir, "error.log"), logEntry, "utf8");

  // Pass error to next middleware
  next(err);
};

module.exports = errorLogger;
