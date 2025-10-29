const express = require('express');
const router = express.Router();
const { createComplaint, getUserComplaints } = require('../controllers/complaintController');

// Import the user authentication middleware
const { protectUser } = require('../middleware/authMiddleware');

// Protect the routes to ensure only logged-in users can access
router.post('/', protectUser, createComplaint);
router.get('/my-complaints', protectUser, getUserComplaints);

module.exports = router;
