const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    // Exclude passwords from the result
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

// @desc    Update a user by ID
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, status, location, phone, address } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;
    user.location = location || user.location;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.lastActive = new Date();

    const updatedUser = await user.save();

    // Send back user data without the password
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      location: updatedUser.location,
      phone: updatedUser.phone,
      address: updatedUser.address,
      joinDate: updatedUser.joinDate,
      totalPickups: updatedUser.totalPickups,
      ecoPoints: updatedUser.ecoPoints,
      lastActive: updatedUser.lastActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating user' });
  }
};

// @desc    Delete a user by ID
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
};