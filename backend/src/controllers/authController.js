const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail.js");
const { userSignups, logins } = require("../metrics");

const JWT_SECRET = process.env.JWT_SECRET || "eduresume_secret_dummy";
const SALT_ROUNDS = 10;

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "student",
    });

    await user.save();

    const token = generateToken(user);
    userSignups.inc({ method: "email" });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    logins.inc({method: "email"});

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const emailHtml = `
      <h2>Password Reset - EduResumePRO</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>This link is valid for 15 minutes.</p>
    `;

    await sendEmail(user.email, "Reset your EduResumePRO password", emailHtml);

    res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing forgot password" });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetPasswordToken !== token) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    res.status(200).json({ message: "Token valid", userId: user._id });
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Password reset failed" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name if provided
    if (name && name.trim() !== "") {
      user.name = name.trim();
    }

    // Update email if provided (and not already used by someone else)
    if (email && email.trim() !== "" && email !== user.email) {
      const existing = await User.findOne({ email: email.trim() });
      if (existing && existing._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email.trim();
    }

    // If user wants to change password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to set a new password",
        });
      }

      const isCurrentValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentValid) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
      user.password = hashed;
    }

    await user.save();

    // Optionally issue a fresh token (in case email/claims changed)
    const token = generateToken(user);

    return res.status(200).json({
      message: "Profile updated successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging out" });
  }
};

const getProfessors = async (req, res) => {
  try {
    const professors = await User.find({ role: 'professor' }).select('name email _id');
    res.status(200).json({ professors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch professors' });
  }
};

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  updateProfile,
  getProfessors
};
