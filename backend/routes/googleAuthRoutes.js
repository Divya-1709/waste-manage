const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// ====== INITIATE GOOGLE OAUTH ======
router.get(
  "/google",
  (req, res, next) => {
    console.log("🚀 Initiating Google OAuth...");
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// ====== GOOGLE OAUTH CALLBACK ======
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("📥 Received callback from Google");
    console.log("Query params:", req.query);
    next();
  },
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    session: false,
  }),
  (req, res) => {
    try {
      console.log("✅ Authentication successful for user:", req.user.email);

      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&name=${encodeURIComponent(
        req.user.name
      )}`;
      
      console.log("🔄 Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Error in Google callback:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);

// ====== ERROR HANDLER ======
router.use((err, req, res, next) => {
  console.error("❌ Google Auth Error:", err);
  res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
});

// ====== LOGOUT ROUTE ======
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;