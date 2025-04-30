require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");
const dbconnection = require("./config/DBconnection.js");

// Constants
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
dbconnection();

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  // Exit process
  process.exit(1);
});

// Handle SIGTERM signal (for graceful shutdown in containerized environments)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});