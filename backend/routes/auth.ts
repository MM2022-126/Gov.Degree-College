import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Rate limiter for login endpoint - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per windowMs
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for non-login routes
    return req.method !== "POST" || !req.path.includes("/login");
  },
});

router.post("/auth/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Verify email
    if (email !== process.env.ADMIN_EMAIL) {
      console.error(`Failed login attempt at ${new Date()} from ${req.ip} - invalid email`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if using bcrypt hash or plain password (for backward compatibility during transition)
    let isPasswordValid = false;
    
    if (process.env.ADMIN_PASSWORD_HASH) {
      // Use bcrypt comparison if hash is available
      try {
        isPasswordValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
      } catch (hashError) {
        console.error("Bcrypt comparison error:", hashError);
        isPasswordValid = false;
      }
    } else if (process.env.ADMIN_PASSWORD) {
      // Fallback to plain text comparison (for development only)
      isPasswordValid = password === process.env.ADMIN_PASSWORD;
    } else {
      console.error("No admin password configured in environment");
      return res.status(500).json({ error: "Server configuration error" });
    }

    if (!isPasswordValid) {
      console.error(`Failed login attempt at ${new Date()} from ${req.ip} - invalid password`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`Admin logged in successfully at ${new Date()} from ${req.ip}`);
    const token = generateToken(email);

    // Set HttpOnly cookie instead of returning token in response body
    res.cookie("admin_token", token, {
      httpOnly: true, // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
      sameSite: "lax", // CSRF protection
      maxAge: 8 * 60 * 60 * 1000, // 8 hours expiry
      path: "/", // Cookie available for all routes
    });

    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/logout", async (req, res) => {
  try {
    // Clear the HttpOnly cookie
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
});

router.get("/auth/verify", verifyToken, async (req: AuthRequest, res) => {
  try {
    // If verifyToken middleware didn't throw, token is valid
    res.json({ valid: true, admin: { email: req.user?.email } });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

export default router;
