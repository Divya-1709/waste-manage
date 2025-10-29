require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");

// Import routes
const userAuthRoutes = require("./routes/userAuth");
const adminAuthRoutes = require("./routes/adminAuth");
const adminRoutes = require("./routes/adminRoutes");
const pickupRoutes = require("./routes/pickupRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { protectUser } = require("./middleware/authMiddleware");

// Import models
const Admin = require("./models/Admin");
const User = require("./models/User");

// Import Google OAuth passport config
require("./config/passportGoogle");

// Connect to MongoDB
connectDB();

const app = express();
app.set("trust proxy", 1);

// ====== CORS (MUST BE BEFORE SESSION) ======
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ====== STRIPE WEBHOOK (MUST BE BEFORE express.json()) ======
// The webhook needs the raw body, so we apply this middleware only to the webhook route.
// app.use("/api/payments", paymentRoutes);

// ====== MIDDLEWARE ======
app.use(cookieParser());
app.use(express.json());

// ====== SESSION CONFIG (USE express-session, NOT cookie-session) ======
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ====== SEED FUNCTIONS ======
const seedAdmin = async () => {
  try {
    const adminEmail = "admin@nec.edu.in";
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("123", 10);
      await Admin.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
      });
      console.log("Permanent admin created ✅");
    } else {
      console.log("Permanent admin already exists ✅");
    }
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
};

const seedTestUser = async () => {
  try {
    const testEmail = "test@gmail.com";
    let user = await User.findOne({ email: testEmail });
    if (!user) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        name: "Test User",
        email: testEmail,
        password: hashedPassword,
      });
      console.log("Test user created ✅");
    } else {
      console.log("Test user already exists ✅");
    }
  } catch (error) {
    console.error("Error seeding test user:", error.message);
  }
};

// Run seeders
seedAdmin();
seedTestUser();

// ====== ROUTES ======
app.use("/api/user", userAuthRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/payments", protectUser, paymentRoutes); // Secure payment routes

// ====== ROOT TEST ROUTE ======
app.get("/", (req, res) => {
  res.send("Waste Management API is running 🚀");
});

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});