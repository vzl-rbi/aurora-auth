import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const COOKIE_NAME = process.env.COOKIE_NAME || "token";

// Register page
router.get("/register", (req, res) => res.render("register", { error: null }));

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.render("register", { error: "All fields required" });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.render("register", { error: "Email already in use" });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
    res.cookie(COOKIE_NAME, token, { httpOnly: true, maxAge: 3600 * 1000 });
    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("register", { error: "Server error" });
  }
});

// Login page
router.get("/login", (req, res) => res.render("login", { error: null }));

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.render("login", { error: "All fields required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.render("login", { error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render("login", { error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
    res.cookie(COOKIE_NAME, token, { httpOnly: true, maxAge: 3600 * 1000 });
    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("login", { error: "Server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.redirect("/login");
});

export default router;
