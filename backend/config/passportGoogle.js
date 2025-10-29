require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// ====== DEBUG: Log OAuth Config ======
console.log("=== Google OAuth Configuration ===");
console.log("Client ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
console.log("Callback URL:", `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`);
console.log("==================================");

// ====== GOOGLE STRATEGY CONFIG ======
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("✅ Google OAuth Success — Profile:", {
            id: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value
          });

          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          // If new user, create one
          if (!user) {
            user = new User({
              googleId: profile.id,
              name: profile.displayName || "Unnamed User",
              email: profile.emails?.[0]?.value || "",
              avatar: profile.photos?.[0]?.value || "",
            });
            await user.save();
            console.log("🆕 New Google user created in DB");
          } else {
            console.log("👤 Existing Google user logged in");
          }

          return done(null, user);
        } catch (err) {
          console.error("❌ Error in GoogleStrategy:", err.message);
          return done(err, null);
        }
      }
    )
  );
} else {
  console.log("⚠️ Google OAuth not configured - skipping Google strategy");
}

// ====== SESSION HANDLERS ======
passport.serializeUser((user, done) => {
  console.log("📝 Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("📖 Deserializing user:", id);
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("❌ Deserialization error:", err);
    done(err, null);
  }
});

console.log("🔐 Google Passport Strategy initialized ✅");