const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please add all fields",
      });
    }

    email = email.toLowerCase().trim();

    const userExists = await User.findOne({ email });

    console.log("Collection name:", User.collection.name);
    console.log("Fetched user in register:", userExists);

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email,
      password,
    });

    console.log("Created user:", user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please add email and password",
      });
    }

    email = email.toLowerCase().trim();

    let user = await User.findOne({ email });

    // Check if this is the admin from .env
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      if (!user) {
        // Create admin user if it doesn't exist
        user = await User.create({
          name: 'System Admin',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin'
        });
      } else if (user.role !== 'admin') {
        // Update to admin if not already
        user.role = 'admin';
        await user.save();
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User does not exist",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};