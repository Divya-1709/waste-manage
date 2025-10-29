const Complaint = require('../models/Complaint');
const User = require('../models/User');

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Private (logged-in users)
 */
const createComplaint = async (req, res) => {
    try {
        const { type, description, priority } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const newComplaint = new Complaint({
            userId: req.user._id,
            type,
            description,
            priority: priority || 'medium',
        });

        const savedComplaint = await newComplaint.save();
        await savedComplaint.populate('userId', 'name email');

        res.status(201).json(savedComplaint);
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(400).json({ error: 'Error creating complaint', details: error.message });
    }
};

/**
 * @desc    Get complaints for the logged-in user
 * @route   GET /api/complaints/my-complaints
 * @access  Private
 */
const getUserComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while fetching user complaints' });
    }
};

/**
 * @desc    Get all complaints (admin only)
 * @route   GET /api/admin/complaints
 * @access  Private/Admin
 */
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({})
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while fetching complaints' });
    }
};

/**
 * @desc    Update complaint status (admin only)
 * @route   PUT /api/admin/complaints/:id/status
 * @access  Private/Admin
 */
const updateComplaintStatus = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const updateData = { status };

        if (adminResponse) {
            updateData.adminResponse = adminResponse;
        }

        if (status === 'resolved') {
            updateData.resolvedAt = new Date();
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('userId', 'name email');

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while updating complaint status' });
    }
};

module.exports = {
    createComplaint,
    getUserComplaints,
    getAllComplaints,
    updateComplaintStatus,
};
