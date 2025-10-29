const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'keyboardcat';

const protectUser = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the token, excluding the password
      req.user = await User.findById(decoded.id || decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else if (req.cookies.token) {
    try {
      // Get token from cookie
      token = req.cookies.token;

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the token, excluding the password
      req.user = await User.findById(decoded.id || decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const protectBusiness = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the token, excluding the password
      req.user = await User.findById(decoded.id || decoded.userId).select('-password');

      // Check if user is a business user
      if (req.user.userType !== 'business') {
        return res.status(403).json({ error: 'Access denied. Business account required.' });
      }

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else if (req.cookies.token) {
    try {
      // Get token from cookie
      token = req.cookies.token;

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the token, excluding the password
      req.user = await User.findById(decoded.id || decoded.userId).select('-password');

      // Check if user is a business user
      if (req.user.userType !== 'business') {
        return res.status(403).json({ error: 'Access denied. Business account required.' });
      }

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

module.exports = { protectUser, protectBusiness };
