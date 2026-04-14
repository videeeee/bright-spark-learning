const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "SECRET_KEY");

    res.json({ 
      msg: "User created",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Signup failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "SECRET_KEY");

    res.json({ 
      msg: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Login failed" });
  }
});

// GET CURRENT USER (protected)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch user" });
  }
});

// UPDATE PROFILE SETUP (protected)
router.put("/profile-setup", auth, async (req, res) => {
  try {
    const { classLevel, curriculum, subjects } = req.body;

    if (!classLevel || !curriculum || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ msg: "Valid class level, curriculum, and subjects required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { classLevel, curriculum, subjects },
      { new: true }
    ).select("-password");

    res.json({ msg: "Profile setup completed", user });
  } catch (err) {
    console.error("Profile setup error:", err);
    res.status(500).json({ msg: "Failed to update profile" });
  }
});

module.exports = router;