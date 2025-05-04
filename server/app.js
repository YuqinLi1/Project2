const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const passport = require("passport");
const { errorHandler } = require("./utils/errorHandler");

// Import routes
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const hrRoutes = require("./routes/hr");
const documentsRoutes = require("./routes/document");
const visaStatusRoutes = require("./routes/visaStatus");

// Initialize express app
const app = express();

// Configure passport
require("./config/passport")(passport);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Request logging

// Passport middleware
app.use(passport.initialize());

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/visa-status", visaStatusRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

module.exports = app;
