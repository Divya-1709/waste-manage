const Pickup = require('../models/Pickup');
const User = require('../models/User'); // Assuming you have a User model

/**
 * @desc    Create a new pickup request
 * @route   POST /api/pickups
 * @access  Private (assuming user must be logged in)
 */
const createPickupRequest = async (req, res) => {
    try {
        const {
            userName,
            userPhone,
            location,
            wasteType,
            date,
            time,
            status,
            priority,
            serviceType,
            wasteCount,
            wasteUnit
        } = req.body;

        // Assuming your authentication middleware adds the user object to req
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // --- Weight Calculation ---
        const calculateWeight = (wasteCount, wasteUnit) => {
            if (wasteUnit === 'kg') return wasteCount;
            if (wasteUnit === 'bins/bags') return wasteCount * 10; // Assume 10kg per bin/bag
            if (wasteUnit === 'ton') return wasteCount * 1000;
            return wasteCount;
        };

        const weight = calculateWeight(wasteCount, wasteUnit);

        // --- Eco Wallet Calculations ---
        const pointsPerKg = { recyclable: 1, organic: 0.5, electronic: 2, hazardous: 1.5 };
        const co2PerKg = { recyclable: 0.5, organic: 0.3, electronic: 1, hazardous: 0.8 };

        const pointsEarned = Math.round(weight * pointsPerKg[wasteType]);
        const co2Saved = weight * co2PerKg[wasteType];

        // --- Payment/Cost Calculation Logic ---
        let cost = 0;
        let finalAmount = 0;
        let discountAdded = 0;
        // Example pricing for business service type
        if (serviceType === 'business') {
            const pricing = {
                general: 50,
                recyclable: 50,
                organic: 40,
                electronic: 100,
                hazardous: 150,
            };
            cost = pricing[wasteType] || 50; // Default cost if wasteType is not in pricing
            cost = cost * wasteCount; // Multiply by waste count
            finalAmount = cost; // For now, no discount is applied at creation
            discountAdded = Math.round(cost * 0.1); // 10% of bill amount added to discount balance
        }

        const newPickup = new Pickup({
            userId: req.user._id,
            userName,
            userPhone,
            location,
            wasteType,
            date,
            time,
            status,
            priority,
            serviceType,
            cost,
            finalAmount,
            paymentStatus: serviceType === 'business' ? 'pending' : 'paid', // Assuming home pickups are free/pre-paid
            weight,
            pointsEarned,
            co2Saved,
            discountAdded
        });

        const savedPickup = await newPickup.save();

        // Update user's eco wallet
        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                ecoPoints: pointsEarned,
                discountBalance: discountAdded,
                co2Saved: co2Saved,
                totalPickups: 1
            }
        });

        res.status(201).json(savedPickup);
    } catch (error) {
        console.error('Error creating pickup request:', error);
        res.status(400).json({ error: 'Error creating pickup request', details: error.message });
    }
};

/**
 * @desc    Get all pickups
 * @route   GET /api/admin/pickups
 * @access  Private/Admin
 */
const getPickups = async (req, res) => {
    try {
        const pickups = await Pickup.find({}).sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('assignedVehicle', 'name licensePlate')
            .populate('driverId', 'name phone');
        res.json(pickups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while fetching pickups' });
    }
};

/**
 * @desc    Assign a pickup to a driver and vehicle
 * @route   PUT /api/admin/pickups/:id/assign
 * @access  Private/Admin
 */
const assignPickup = async (req, res) => {
    try {
        const { driverId, vehicleId, status } = req.body;
        const updateData = {};
        if (driverId) updateData.driverId = driverId;
        updateData.assignedVehicle = vehicleId; // Allow setting vehicle to null
        if (status) updateData.status = status;

        const pickup = await Pickup.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('userId', 'name email').populate('assignedVehicle', 'name licensePlate').populate('driverId', 'name phone');

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        res.json(pickup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while assigning pickup' });
    }
};

/**
 * @desc    Update pickup status
 * @route   PUT /api/admin/pickups/:id/status
 * @access  Private/Admin
 */
const updatePickupStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const pickup = await Pickup.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('userId', 'name email').populate('assignedVehicle', 'name licensePlate').populate('driverId', 'name phone');

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        res.json(pickup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while updating pickup status' });
    }
};

/**
 * @desc    Get pickups for the logged-in user
 * @route   GET /api/pickups/my-pickups
 * @access  Private
 */
const getUserPickups = async (req, res) => {
    try {
        const pickups = await Pickup.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(pickups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while fetching user pickups' });
    }
};

module.exports = {
    createPickupRequest,
    getPickups,
    assignPickup,
    updatePickupStatus,
    getUserPickups,
};
