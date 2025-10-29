const Vehicle = require('../models/Vehicle');

// @desc    Add a new vehicle
// @route   POST /api/admin/vehicles
// @access  Private/Admin
const addVehicle = async (req, res) => {
  try {
    const { name, type, licensePlate, capacity } = req.body;

    const vehicleExists = await Vehicle.findOne({ licensePlate });

    if (vehicleExists) {
      return res.status(400).json({ error: 'Vehicle with this license plate already exists' });
    }

    const vehicle = new Vehicle({
      name,
      type,
      licensePlate,
      capacity,
    });

    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
  } catch (error) {
    res.status(500).json({ error: 'Server error while adding vehicle' });
  }
};

// @desc    Get all vehicles
// @route   GET /api/admin/vehicles
// @access  Private/Admin
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching vehicles' });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/admin/vehicles/:id
// @access  Private/Admin
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Server error while updating vehicle' });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/admin/vehicles/:id
// @access  Private/Admin
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while deleting vehicle' });
  }
};

module.exports = {
  addVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
};