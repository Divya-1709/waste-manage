const Worker = require('../models/Worker');

// @desc    Add a new worker
// @route   POST /api/admin/workers
// @access  Private/Admin
const addWorker = async (req, res) => {
  try {
    const { name, role, phone, assignedVehicle, status } = req.body;

    const workerExists = await Worker.findOne({ phone });

    if (workerExists) {
      return res.status(400).json({ error: 'Worker with this phone number already exists' });
    }

    const worker = new Worker({
      name,
      role,
      phone,
      assignedVehicle,
      status,
    });

    const createdWorker = await worker.save();
    res.status(201).json(createdWorker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while adding worker' });
  }
};

// @desc    Get all workers
// @route   GET /api/admin/workers
// @access  Private/Admin
const getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({});
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching workers' });
  }
};

// @desc    Update a worker
// @route   PUT /api/admin/workers/:id
// @access  Private/Admin
const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating worker' });
  }
};

// @desc    Delete a worker
// @route   DELETE /api/admin/workers/:id
// @access  Private/Admin
const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({ message: 'Worker removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while deleting worker' });
  }
};

module.exports = {
  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
};