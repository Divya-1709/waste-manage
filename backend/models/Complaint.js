const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['missed_pickup', 'late_pickup', 'incomplete_collection', 'driver_behavior', 'billing_issue', 'other'],
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  adminResponse: {
    type: String,
    default: '',
  },
  resolvedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
