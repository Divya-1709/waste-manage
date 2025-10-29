const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['truck', 'van', 'other'], // Example types
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
  },
  capacity: { // e.g., in kilograms or volume
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);