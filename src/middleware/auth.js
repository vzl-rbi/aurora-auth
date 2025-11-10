import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || "token"];
    if (!token) return res.redirect("/login");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.clearCookie(process.env.COOKIE_NAME || "token");
      return res.redirect("/login");
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.clearCookie(process.env.COOKIE_NAME || "token");
    return res.redirect("/login");
  }
};
