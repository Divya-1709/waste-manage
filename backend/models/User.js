const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  userType: { type: String, enum: ['home', 'business'], default: 'home' },
  googleId: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  status: { type: String, default: 'active' },
  location: { type: String, default: 'Unknown' },
  joinDate: { type: Date, default: Date.now },
  totalPickups: { type: Number, default: 0 },
  ecoPoints: { type: Number, default: 0 },
  discountBalance: { type: Number, default: 0 },
  co2Saved: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  phone: { type: String, default: '+1-555-0123' },
  address: { type: String, default: '123 Main St, City, State' },
  profilePicture: { type: String, default: '' },
});

module.exports = mongoose.model('User', userSchema);
