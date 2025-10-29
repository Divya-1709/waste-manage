const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  role: {
    type: String,
    required: true,
    enum: ['driver', 'collector', 'supervisor'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
  },
  assignedVehicle: {
    type: String, // Can be a license plate or vehicle ID
    default: 'N/A',
  },
  status: {
    type: String,
    enum: ['active', 'on-leave', 'inactive'],
    default: 'active',
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  totalTrips: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);