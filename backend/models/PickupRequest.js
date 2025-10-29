const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema({
    // Assuming you have a User model and you're storing the user's ID.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
    },
    city: {
        type: String,
        required: [true, 'Please add a city'],
    },
    wasteType: {
        type: String,
        required: [true, 'Please specify the type of waste'],
        enum: ['General', 'Recycling', 'Green Waste', 'Hazardous'],
    },
    pickupDate: {
        type: Date,
        required: [true, 'Please select a pickup date'],
    },
    status: {
        type: String,
        enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true, // This will add `createdAt` and `updatedAt` fields
});

const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);

module.exports = PickupRequest;