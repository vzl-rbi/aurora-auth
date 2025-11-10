import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import sequelize from "./config/database.js";
import User from "./models/user.js";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Make user available in all templates
import jwt from "jsonwebtoken";
app.use(async (req, res, next) => {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || "token"];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      res.locals.user = user || null;
    } else {
      res.locals.user = null;
    }
  } catch (err) {
    res.locals.user = null;
  }
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/", dashboardRoutes);

// Home redirect
app.get("/", (req, res) => res.redirect("/dashboard"));

// DB sync + start
const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // use migrations in production
    console.log("MySQL connected and models synced");

    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
