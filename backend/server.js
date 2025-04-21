const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const PORT = 5000;
const dbconnection = require("./config/DBconnection.js");
const cookieparser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes.js");
const fileRoutes = require("./routes/productRoutes.js");
const errorMiddleware = require("./middleware/errorMiddleware");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

app.use(cors({ origin: true, credentials: true }));

app.get("/", (req, res) => {});

app.use("/auth", authRoutes);
app.use("/file", fileRoutes);

app.use(errorMiddleware);

dbconnection();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
