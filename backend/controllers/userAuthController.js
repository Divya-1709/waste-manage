const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'keyboardcat';

// Login user with email and password
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Note: status is separate from userType, no need to update status here

    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
    res.json({ ok: true, token, userType: user.userType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Register user with email and password
const registerUser = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email & password required' });
    if (await User.findOne({ email })) return res.status(400).json({ error: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, userType });
    res.json({ ok: true, user: { id: user._id, email: user.email, userType: user.userType } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { loginUser, registerUser };
