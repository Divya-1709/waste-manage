// backend/routes/userAuth.js

const express = require('express');
const { protectUser } = require('../middleware/authMiddleware');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/userAuthController'); // Assuming you'll name the controller function 'loginUser'
const User = require('../models/User');

// Define the login route
// POST /api/user/login
router.post('/login', loginUser);

// Define the registration route
// POST /api/user/register
router.post('/register', registerUser);

// Define the user profile route
// GET /api/user/profile
router.get('/profile', protectUser, async (req, res) => {
  try {
    // req.user is attached by the 'protectUser' middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
// PUT /api/user/profile
router.put('/profile', protectUser, async (req, res) => {
  try {
    const { name, phone, address, profilePicture, userType } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, profilePicture, userType },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
