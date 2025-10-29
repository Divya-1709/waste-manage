const express = require('express');
const router = express.Router();
const { createPickupRequest, getUserPickups } = require('../controllers/pickupController');

// Import the user authentication middleware
const { protectUser } = require('../middleware/authMiddleware');

// Protect the route to ensure only logged-in users can create requests.
// The 'protectUser' middleware will add the user's info to `req.user`.
// POST /api/pickups
router.post('/', protectUser, createPickupRequest);

// GET /api/pickups/my-pickups
router.get('/my-pickups', protectUser, getUserPickups);

module.exports = router;
