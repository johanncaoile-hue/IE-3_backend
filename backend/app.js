const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

// Serving uploaded images
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
);

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// API ROUTES
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// 404 for unknown routes
app.use((req, res, next) => {
  throw new HttpError("Could not find this route.", 404);
});

// GLOBAL ERROR HANDLER
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, () => {});
  }

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "Unknown error!" });
});

// ✅ Connect to MongoDB THEN start server
mongoose
  .connect("mongodb://localhost:27017/mern-places")
  .then(() => {
    app.listen(5005, () => {
      console.log("Connected to MongoDB — backend running on port 5005");
    });
  })
  .catch(err => {
    console.log("MongoDB connection failed:", err);
  });

