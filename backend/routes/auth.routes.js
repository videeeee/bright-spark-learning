const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const env = require("../config/env");

const router = express.Router();

// Validation Schemas
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const profileSetupSchema = z.object({
  classLevel: z.string().min(1, "Class level is required"),
  curriculum: z.string().min(1, "Curriculum is required"),
  subjects: z.array(z.string()).min(1, "At least one subject must be selected"),
});

const settingsUpdateSchema = z.object({
  companion: z.enum(["solin", "pyro", "aqua", "lumi", "verdi"]).optional(),
  settings: z
    .object({
      dailyReminders: z.boolean().optional(),
      streakAlerts: z.boolean().optional(),
      newContent: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
    })
    .optional(),
});

/**
 * POST /api/auth/signup & /api/auth/register (backward compatibility)
 */
const handleSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        msg: "An account with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      msg: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        classLevel: user.classLevel,
        curriculum: user.curriculum,
        subjects: user.subjects,
        companion: user.companion,
      },
    });
  } catch (err) {
    next(err);
  }
};

router.post("/signup", validate({ body: signupSchema }), handleSignup);
router.post("/register", validate({ body: signupSchema }), handleSignup);

/**
 * POST /api/auth/login
 */
router.post("/login", validate({ body: loginSchema }), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        classLevel: user.classLevel,
        curriculum: user.curriculum,
        subjects: user.subjects,
        companion: user.companion,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me (Protected)
 */
router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User profile not found",
      });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/auth/profile-setup (Protected)
 */
router.put("/profile-setup", auth, validate({ body: profileSetupSchema }), async (req, res, next) => {
  try {
    const { classLevel, curriculum, subjects } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { classLevel, curriculum, subjects },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({
      success: true,
      msg: "Profile setup completed",
      user,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/auth/settings (Protected)
 */
router.put("/settings", auth, validate({ body: settingsUpdateSchema }), async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.companion) updates.companion = req.body.companion;
    if (req.body.settings) {
      Object.entries(req.body.settings).forEach(([key, value]) => {
        updates[`settings.${key}`] = value;
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({
      success: true,
      msg: "Settings updated",
      user,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;