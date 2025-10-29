const express = require('express');
const jwt = require('jsonwebtoken');
const {
  addVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const {
  getPickups,
  assignPickup,
  updatePickupStatus,
} = require('../controllers/pickupController');
const {
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const {
  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
} = require('../controllers/workerController');
const {
  getReportsData,
} = require('../controllers/reportController');
const {
  getAllComplaints,
  updateComplaintStatus,
} = require('../controllers/complaintController');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'keyboardcat';

// Middleware to protect admin routes
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized as an admin' });
    }
    req.user = decoded; // Attach user info to the request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Apply middleware to all routes in this file
router.use(authMiddleware);

// Vehicle Routes
router.route('/vehicles').post(addVehicle).get(getVehicles);
router.route('/vehicles/:id').put(updateVehicle).delete(deleteVehicle);

// Pickup Routes
router.route('/pickups').get(getPickups);
router.put('/pickups/:id/assign', assignPickup);
router.put('/pickups/:id/status', updatePickupStatus);

// User Routes
router.route('/users').get(getUsers);
router.route('/users/:id').put(updateUser).delete(deleteUser);

// Worker Routes
router.route('/workers').post(addWorker).get(getWorkers);
router.route('/workers/:id').put(updateWorker).delete(deleteWorker);

// Reports Route
router.get('/reports', getReportsData);

// Complaint Routes
router.route('/complaints').get(getAllComplaints);
router.put('/complaints/:id/status', updateComplaintStatus);

module.exports = router;
