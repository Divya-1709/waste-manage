const Razorpay = require("razorpay");
const crypto = require("crypto");
const Pickup = require("../models/Pickup");

// ====== INIT RAZORPAY ======
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create a Razorpay order for a pickup
 * @route   POST /api/payments/create-order
 * @access  Private (Business Users Only)
 */
exports.createOrder = async (req, res) => {
  try {
    const { pickupId, finalAmount } = req.body; // Accept finalAmount from frontend
    const userId = req.user ? req.user._id : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Find the pickup request
    const pickup = await Pickup.findById(pickupId);
    if (!pickup) {
      return res.status(404).json({ success: false, message: "Pickup not found." });
    }

    // Ensure only business user can pay for their pickup
    if (!pickup.userId || pickup.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to pay for this pickup." });
    }

    if (pickup.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Pickup already paid." });
    }

    // Use finalAmount from request, fallback to pickup data, then to a default.
    // Ensure it's a number.
    let amount = 100; // Default amount
    if (finalAmount && !isNaN(parseFloat(finalAmount))) {
      amount = parseFloat(finalAmount);
    } else {
      amount = pickup.finalAmount || pickup.cost || 100;
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `pickup_${pickupId}_${Date.now()}`,
      notes: {
        pickupId: pickup._id.toString(),
        userId: userId.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    // Store order ID temporarily in pickup record
    pickup.razorpayOrderId = order.id;
    await pickup.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      finalAmount: amount, // Include the actual amount used
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create order" });
  }
};

/**
 * @desc    Verify Razorpay payment signature and update pickup status
 * @route   POST /api/payments/verify-payment
 * @access  Private
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Find pickup by stored Razorpay order ID
    const pickup = await Pickup.findOne({ razorpayOrderId: razorpay_order_id });
    if (!pickup) {
      return res.status(404).json({ success: false, message: "Pickup not found for this order" });
    }

    // Mark as paid
    pickup.paymentStatus = "paid";
    pickup.razorpayPaymentId = razorpay_payment_id;
    pickup.paymentId = razorpay_payment_id; // Store in paymentId as well for consistency
    await pickup.save();

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};
