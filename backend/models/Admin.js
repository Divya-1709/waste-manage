const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed
  totpSecret: { type: String },   // speakeasy secret (base32)
  is2FAEnabled: { type: Boolean, default: false },
  // maybe other admin metadata
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
