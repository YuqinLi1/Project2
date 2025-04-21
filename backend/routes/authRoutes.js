const express = require("express");
const {
  registerUser,
  userLogin,
} = require("../controller/authController.js");
const { userAuth } = require("../middleware/authMiddleware.js");
const { getMe } = require("../controller/authController");
const { logoutUser } = require("../controller/authController");

const route = express.Router();

route.post("/register", registerUser);

route.post("/login", userLogin);

