const User = require('../models/User');
const Worker = require('../models/Worker');
const Vehicle = require('../models/Vehicle');
const Pickup = require('../models/Pickup');

// @desc    Get comprehensive reports data
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReportsData = async (req, res) => {
  try {
    // Get current date and date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Parallel data fetching for better performance
    const [
      totalUsers,
      activeUsers,
      totalWorkers,
      activeWorkers,
      totalVehicles,
      activeVehicles,
      totalPickups,
      completedPickups,
      pendingPickups,
      monthlyPickups,
      yearlyPickups,
      wasteStats,
      pickupTrends
    ] = await Promise.all([
      // User stats
      User.countDocuments({}),
      User.countDocuments({}), // Assuming all users are active for now

      // Worker stats
      Worker.countDocuments({}),
      Worker.countDocuments({ status: 'active' }),

      // Vehicle stats
      Vehicle.countDocuments({}),
      Vehicle.countDocuments({}), // Assuming all vehicles are active for now

      // Pickup stats
      Pickup.countDocuments({}),
      Pickup.countDocuments({ status: 'completed' }),
      Pickup.countDocuments({ status: 'pending' }),

      // Monthly pickups (current month)
      Pickup.countDocuments({
        createdAt: { $gte: startOfMonth },
        status: 'completed'
      }),

      // Yearly pickups
      Pickup.countDocuments({
        createdAt: { $gte: startOfYear },
        status: 'completed'
      }),

      // Waste collection stats (sum of completed pickups)
      Pickup.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            totalWaste: { $sum: 1 }, // You can modify this based on actual waste weight field
            avgWastePerPickup: { $avg: 1 }
          }
        }
      ]),

      // Monthly trends for the last 6 months
      Pickup.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            users: { $addToSet: '$userId' },
            pickups: { $sum: 1 },
            completedPickups: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            month: {
              $concat: [
                {
                  $arrayElemAt: [
                    ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    '$_id.month'
                  ]
                },
                '-',
                { $substr: ['$_id.year', 2, 2] }
              ]
            },
            users: { $size: '$users' },
            pickups: 1,
            completedPickups: 1,
            workers: { $literal: 0 }, // Will be updated with actual worker data
            vehicles: { $literal: 0 }  // Will be updated with actual vehicle data
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Calculate additional metrics
    const recyclingRate = 78; // This could be calculated based on waste types

    // Get actual complaint data
    // Note: It's better to import models at the top of the file.
    const Complaint = require('../models/Complaint');
    const activeComplaints = await Complaint.countDocuments({ status: { $in: ['pending', 'in_progress'] } });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const complaints = {
      active: activeComplaints,
      resolved: resolvedComplaints,
      total: activeComplaints + resolvedComplaints
    };

    // Calculate efficiency rates
    const userEfficiency = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;
    const workerEfficiency = totalWorkers > 0 ? ((activeWorkers / totalWorkers) * 100).toFixed(1) : 0;
    const vehicleEfficiency = totalVehicles > 0 ? ((activeVehicles / totalVehicles) * 100).toFixed(1) : 0;
    const pickupEfficiency = totalPickups > 0 ? ((completedPickups / totalPickups) * 100).toFixed(1) : 0;

    // Prepare monthly trends data (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = now.getMonth();
    const monthlyTrends = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = now.getFullYear() - (currentMonth - i < 0 ? 1 : 0);
      const monthName = `${months[monthIndex]}-${year.toString().slice(-2)}`;

      const existingData = pickupTrends.find(t => t.month === monthName) || {
        users: 0,
        pickups: 0,
        completedPickups: 0,
        workers: 0,
        vehicles: 0
      };

      monthlyTrends.push({
        month: monthName,
        users: existingData.users, // Keep for potential future use
        pickups: existingData.completedPickups, // Using completed pickups
        workers: Math.floor(Math.random() * 3) + 6, // Mock data
        vehicles: Math.floor(Math.random() * 2) + 8, // Mock data
        totalWaste: parseFloat((Math.random() * 0.5 + 1.5).toFixed(1)), // Mock total waste data in Tons
        recycledWaste: parseFloat(((Math.random() * 0.5 + 1.5) * (recyclingRate / 100)).toFixed(1)) // Mock recycled waste
      });
    }

    // Prepare response data
    const reportData = {
      summary: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        workers: {
          total: totalWorkers,
          active: activeWorkers,
          onLeave: totalWorkers - activeWorkers
        },
        vehicles: {
          total: totalVehicles,
          active: activeVehicles,
          maintenance: totalVehicles - activeVehicles
        },
        pickups: {
          total: totalPickups,
          completed: completedPickups,
          pending: pendingPickups
        }
      },
      metrics: {
        wasteCollected: wasteStats.length > 0 ? wasteStats[0].totalWaste : 0,
        recyclingRate: recyclingRate,
        complaints: complaints
      },
      efficiency: {
        users: userEfficiency,
        workers: workerEfficiency,
        vehicles: vehicleEfficiency,
        pickups: pickupEfficiency
      },
      trends: {
        monthly: monthlyTrends,
        growth: {
          users: totalUsers > 0 ? ((monthlyPickups / totalUsers) * 100).toFixed(1) : 0,
          pickups: monthlyPickups,
          waste: wasteStats.length > 0 ? wasteStats[0].totalWaste : 0
        }
      },
      lastUpdated: new Date()
    };

    res.json(reportData);
  } catch (error) {
    console.error('Error fetching reports data:', error);
    res.status(500).json({ error: 'Server error while fetching reports data' });
  }
};

module.exports = {
  getReportsData
};
