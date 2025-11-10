import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    // Quick stats example
    const usersCount = await User.count();
    return res.render("dashboard", { user, stats: { usersCount } });
  } catch (err) {
    console.error(err);
    return res.redirect("/login");
  }
});

export default router;
