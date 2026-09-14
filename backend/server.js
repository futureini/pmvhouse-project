/* =========================
   LOAD ENV FIRST
========================= */
require("dotenv").config();

/* =========================
   IMPORTS
========================= */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

/* =========================
   INIT APP
========================= */
const app = express();

/* =========================
   ROUTES IMPORT
========================= */
const houseRoutes = require("./routes/houseRoutes");
const propertyRoutes = require("./routes/propertyRoutes"); // ✅ FIX ADDED

/* =========================
   CONFIG
========================= */
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "1993@123";
const SECRET = process.env.SECRET || "mysecretkey";
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */
// FRONTEND_URL can be a single origin or a comma-separated list
// (e.g. "https://pmvproperties.vercel.app,https://pmvproperties.com"). Defaults to "*"
// so the app keeps working immediately after deploy; tighten this once your
// frontend domain is final (see DEPLOYMENT-GUIDE.md).
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : "*";

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   DATABASE CONNECTION
   Images are stored on Cloudinary (see middleware/upload.js), so no local
   "uploads" folder or static file route is needed — this also means
   nothing breaks on hosts with an ephemeral filesystem, like Render.
========================= */
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pmvhouse")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  });

/* =========================
   LOGIN ROUTE
========================= */
app.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = jwt.sign({ username }, SECRET, {
        expiresIn: "1d",
      });

      return res.json({ token });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("✅ API Running...");
});

/* =========================
   API ROUTES
========================= */
app.use("/api/houses", houseRoutes);
app.use("/api/properties", propertyRoutes); // ✅ IMPORTANT FIX

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Something went wrong",
  });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
