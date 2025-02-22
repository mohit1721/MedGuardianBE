const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate Fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const emailRegex = /.+\@.+\..+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Check if User Already Exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create New User
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ success: true,newUser, message: "User registered successfully. Please login to access" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Error in Creating User" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({success:false, error: "User does not exists" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Password" });

    const token = generateToken(user._id);
  return res.status(201).json({success: true, token, user, message:"User logged in Successfully" });
  } catch (error) {
   return res.status(500).json({success: false, message: "Issue In Login" });
  }
};
const logout = (req, res) => {
  try {
    // Here, the server doesn't have to invalidate the JWT token since it's stateless.
    // We just let the frontend handle the removal of the token.
    res.status(200).json({success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error", details: error.message });
  }
};

module.exports = { logout };

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // Exclude password field
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({success: true, user});
    } catch (error) {
        res.status(500).json({ success: false,error: "Server Error" });
    }
};
module.exports = { registerUser, logout,loginUser,getUserProfile };
