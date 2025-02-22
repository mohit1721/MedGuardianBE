const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

// Get user profile (Protected Route)
router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;
