
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";

const router = express.Router();

// Protect routes that require an existing admin login
const requireAdmin = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Please log in as an admin first.",
    });
  }

  try {
    const token = authorization.slice(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.adminId = decoded.adminId;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid. Please log in again.",
    });
  }
};

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured on the server.",
      });
    }

    const admin = await Admin.findOne({
      username: username.trim().toLowerCase(),
    }).select("+passwordHash");

    if (
      !admin ||
      !(await bcrypt.compare(password, admin.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin username or password.",
      });
    }

    const token = jwt.sign(
      { adminId: String(admin._id) },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: String(admin._id),
        name: admin.name,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in. Please try again.",
    });
  }
});

// Register a new admin.
// Only an already authenticated admin can use this route.
router.post("/register", requireAdmin, async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (
      !name?.trim() ||
      !username?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingAdmin = await Admin.findOne({
      $or: [
        { username: cleanUsername },
        { email: cleanEmail },
      ],
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newAdmin = await Admin.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: "New admin registered successfully.",
      admin: {
        id: String(newAdmin._id),
        name: newAdmin.name,
        username: newAdmin.username,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to register the admin.",
    });
  }
});

// Request a password-reset email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email.",
      });
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      return res.status(503).json({
        success: false,
        message: "Email service is not configured yet.",
      });
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    });

    // Return the same message whether the account exists or not.
    if (admin) {
      const rawToken = crypto.randomBytes(32).toString("hex");

      admin.resetTokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      admin.resetTokenExpiresAt = new Date(
        Date.now() + 15 * 60 * 1000
      );

      await admin.save();

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      try {
        const appUrl = (
          process.env.APP_URL || "http://localhost:5173"
        ).replace(/\/$/, "");

        const resetUrl =
          `${appUrl}/?resetToken=${rawToken}`;

        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: admin.email,
          subject: "Student Attendance System - Password Reset",
          text:
            `A password reset was requested for your admin account.\n\n` +
            `Open this link within 15 minutes:\n${resetUrl}\n\n` +
            `If you did not request this, ignore this email.`,
        });
      } catch (mailError) {
        // Invalidate the token if the email could not be sent.
        admin.resetTokenHash = null;
        admin.resetTokenExpiresAt = null;
        await admin.save();

        console.error("Password reset email error:", mailError);

        return res.status(502).json({
          success: false,
          message: "Unable to send the reset email. Check email configuration.",
        });
      }
    }

    return res.json({
      success: true,
      message:
        "If an account exists for that email, password-reset instructions will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process the password-reset request.",
    });
  }
});

// Set a new password using the emailed reset token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const admin = await Admin.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
    }).select("+resetTokenHash +resetTokenExpiresAt");

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired.",
      });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    admin.resetTokenHash = null;
    admin.resetTokenExpiresAt = null;

    await admin.save();

    return res.json({
      success: true,
      message: "Password changed successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset the password.",
    });
  }
});

export default router;
