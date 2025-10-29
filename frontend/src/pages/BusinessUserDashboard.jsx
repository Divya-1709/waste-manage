import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Award, DollarSign, Download, Building2, Leaf, Heart, CreditCard, BarChart3, CheckCircle, X, Share2, Gift, Tag, Bell, LogOut, Users, TrendingUp, Package, Clock, MapPin, Menu } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const BusinessUserDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [notifications] = useState(3);

  const [pickups, setPickups] = useState([]);
  const [businessProfile, setBusinessProfile] = useState({});
  const [ecoWallet, setEcoWallet] = useState({
    points: 0,
    discountBalance: 0,
    co2Saved: 0
  });
  const [bills, setBills] = useState([]);
  const [newPickup, setNewPickup] = useState({
    date: '',
    frequency: 'weekly',
    wasteType: 'recyclable',
    branch: 'main',
    wasteCount: 1,
    wasteUnit: 'bins/bags',
  });
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        // Fetch user profile
        const profileResponse = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await profileResponse.json();
        setBusinessProfile({
          name: userData.name,
          type: userData.userType,
          location: userData.location || userData.address,
          contact: userData.phone,
          branches: 1, // Default, can be updated based on user data
          email: userData.email
        });

        setEcoWallet({
          points: userData.ecoPoints || 0,
          discountBalance: userData.discountBalance || 0,
          co2Saved: userData.co2Saved || 0
        });

        // Generate referral code based on user ID
        const refCode = 'ECO' + (userData._id || userData.id).substr(-6).toUpperCase();
        setReferralCode(refCode);

        // Fetch user's pickups
        const pickupsResponse = await fetch('/api/pickups/my-pickups', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (pickupsResponse.ok) {
          const userPickups = await pickupsResponse.json();
          const formattedPickups = userPickups.map(pickup => ({
            id: pickup._id,
            date: pickup.date,
            type: `${pickup.wasteType.charAt(0).toUpperCase() + pickup.wasteType.slice(1)} (${pickup.wasteCount || 1} ${pickup.wasteUnit || 'bins/bags'})`,
            weight: pickup.weight,
            status: pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1),
            points: pickup.pointsEarned
          }));
          setPickups(formattedPickups);

          // Create bills from all pickups (for business users)
          const formattedBills = userPickups.map(pickup => ({
            id: pickup._id,
            amount: pickup.cost || 0, // Default to 0 if cost is not available
            dueDate: new Date(new Date(pickup.date).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: `Pickup on ${pickup.date}`,
            status: pickup.paymentStatus,
            paymentId: pickup.paymentId,
            paidAmount: pickup.finalAmount,
            date: pickup.paymentStatus === 'paid' ? new Date(pickup.updatedAt).toISOString().split('T')[0] : null
          }));
          setBills(formattedBills);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const generateQR = async () => {
      if (!referralCode) return;

      try {
        const url = `https://ecowaste-management.vercel.app?ref=${referralCode}`;
        const qrDataUrl = await QRCode.toDataURL(url, { width: 256, margin: 2, color: { dark: '#003D5C', light: '#FFFFFF' } });
        setQrCodeUrl(qrDataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
        // Fallback: create a simple text-based QR placeholder
        setQrCodeUrl('data:image/svg+xml;base64,' + btoa(`
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <text x="100" y="90" text-anchor="middle" font-family="Arial" font-size="12" fill="#003D5C">QR Code</text>
            <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">${referralCode}</text>
          </svg>
        `));
      }
    };
    generateQR();
  }, [referralCode]);

  const [coupons, setCoupons] = useState([
    { id: 1, code: 'SAVE10', discount: 10, type: 'percentage', expiryDate: '2025-11-30', status: 'active', usedCount: 0 },
    { id: 2, code: 'WELCOME500', discount: 500, type: 'fixed', expiryDate: '2025-10-31', status: 'active', usedCount: 0 },
    { id: 3, code: 'ECO20', discount: 20, type: 'percentage', expiryDate: '2025-12-31', status: 'active', usedCount: 0 }
  ]);

  const applyCoupon = () => {
    const coupon = coupons.find(c => c.code === couponInput.toUpperCase() && c.status === 'active');
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponInput('');
      alert(`✅ Coupon ${coupon.code} applied! You get ${coupon.type === 'percentage' ? coupon.discount + '%' : '₹' + coupon.discount} off`);
    } else {
      alert('❌ Invalid or expired coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const shareReferral = (method) => {
    const websiteUrl = 'https://ecowaste-management.vercel.app'; // Replace with actual website URL
    const referralUrl = `${websiteUrl}?ref=${referralCode}`;
    const message = `🌱 Join EcoWaste Management for sustainable waste solutions!\n\nUse my referral code: ${referralCode}\n\n✅ You get ₹500 OFF\n✅ I get ₹500 reward\n\nLet's make the planet greener together! 🌍\n\n${referralUrl}`;

    switch(method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=Join EcoWaste Management&body=${encodeURIComponent(message)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(message);
        alert('✅ Referral link copied to clipboard!');
        break;
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `EcoWaste-Referral-${referralCode}.png`;
      link.href = qrCodeUrl;
      link.click();
    } else {
      alert('QR Code not ready. Please try again.');
    }
  };

  const handlePaymentSuccess = (bill, paymentId, finalAmount, discountAmount) => {
    setPaymentProcessing(false);
    setPaymentSuccess(true);
    
    setBills(bills.map(b => 
      b.id === bill.id 
        ? { ...b, status: 'paid', paymentId, paidAmount: finalAmount, date: new Date().toISOString().split('T')[0] }
        : b
    ));

    if (discountAmount > 0) {
      setEcoWallet({
        ...ecoWallet,
        discountBalance: Math.max(ecoWallet.discountBalance - (discountAmount - (appliedCoupon ? (appliedCoupon.type === 'percentage' ? (bill.amount * appliedCoupon.discount) / 100 : appliedCoupon.discount) : 0)), 0)
      });
    }

    if (appliedCoupon) {
      setCoupons(coupons.map(c => c.id === appliedCoupon.id ? { ...c, usedCount: c.usedCount + 1 } : c));
      setAppliedCoupon(null);
    }

    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentModal(false);
      setSelectedBill(null);
    }, 2000);
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedBill) return;
    setPaymentProcessing(true);

    try {
      let discountAmount = Math.min(selectedBill.amount * 0.1, ecoWallet.discountBalance);

      if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
          discountAmount += (selectedBill.amount * appliedCoupon.discount) / 100;
        } else {
          discountAmount += appliedCoupon.discount;
        }
      }

      const finalAmount = Math.max(selectedBill.amount - discountAmount, 0);

      const token = localStorage.getItem('token');
      const createOrderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pickupId: selectedBill.id, finalAmount }),
      });

      if (createOrderResponse.ok) {
        // Simulate successful payment for now
        // Generate mock payment ID
        const mockPaymentId = `pay_mock_${Date.now()}`;

        // Simulate successful payment
        handlePaymentSuccess(selectedBill, mockPaymentId, finalAmount, discountAmount);
      } else {
        throw new Error('Failed to create payment order');
      }
    } catch (error) {
      const errorData = error.response ? await error.response.json() : { message: error.message };
      const errorMessage = errorData.message || 'Payment failed. Please try again.';
      console.error('Payment error:', errorMessage, errorData);
      alert(`Payment failed: ${errorMessage}`);
      setPaymentProcessing(false);
    }
  };

  const handleSchedulePickup = async () => {
    if (newPickup.date) {
      try {
        // Prepare data to send to backend
        const pickupData = {
          userName: businessProfile.name, // Assuming businessProfile has the name
          userPhone: businessProfile.contact,
          location: businessProfile.location,
          wasteType: newPickup.wasteType,
          date: newPickup.date,
          time: '09:00', // Default time, can be made configurable
          status: 'pending',
          priority: 'medium',
          serviceType: 'business',
          wasteCount: newPickup.wasteCount,
          wasteUnit: newPickup.wasteUnit
        };

        // Get auth token from localStorage or wherever it's stored
        const token = localStorage.getItem('token'); // Adjust based on how you store the token

        // Make API call to backend
        const response = await fetch('/api/pickups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '', // Include auth token if available
          },
          body: JSON.stringify(pickupData)
        });

        if (!response.ok) {
          throw new Error('Failed to schedule pickup');
        }

        const savedPickup = await response.json();

        // Create new pickup and bill from server response
        const newPickupEntry = {
            id: savedPickup._id,
            date: savedPickup.date,
            type: `${savedPickup.wasteType.charAt(0).toUpperCase() + savedPickup.wasteType.slice(1)} (${savedPickup.wasteCount || 1} ${savedPickup.wasteUnit || 'bins/bags'})`,
            weight: savedPickup.weight,
            status: 'Scheduled',
            points: savedPickup.pointsEarned || 0,
        };
        setPickups(prev => [newPickupEntry, ...prev]);

        const dueDate = new Date(savedPickup.date);
        dueDate.setDate(dueDate.getDate() + 10);
        const newBill = {
          id: savedPickup._id,
          amount: savedPickup.cost || 0,
          dueDate: dueDate.toISOString().split('T')[0],
          description: `Pickup on ${savedPickup.date}`,
          status: 'pending',
        };
        setBills([newBill, ...bills]);

        // Update Eco Wallet with backend data
        setEcoWallet({
          points: ecoWallet.points + savedPickup.pointsEarned,
          discountBalance: ecoWallet.discountBalance + savedPickup.discountAdded,
          co2Saved: ecoWallet.co2Saved + savedPickup.co2Saved
        });

        // Reset form
        setNewPickup({ date: '', frequency: 'weekly', wasteType: 'recyclable', branch: 'main', wasteCount: 1, wasteUnit: 'bins/bags' });

        alert(`✅ Pickup scheduled successfully! Earned ${savedPickup.pointsEarned} points, ₹${savedPickup.discountAdded} discount, and saved ${savedPickup.co2Saved.toFixed(2)}kg CO₂!`);
      } catch (error) {
        console.error('Error scheduling pickup:', error);
        alert('❌ Failed to schedule pickup. Please try again.');
      }
    }
  };

  const handleDonatePoints = (amount) => {
    if (ecoWallet.points >= amount) {
      setEcoWallet({ ...ecoWallet, points: ecoWallet.points - amount });
      alert(`✅ Donated ${amount} points to environmental NGO!`);
    }
  };

  const downloadInvoice = (bill) => {
    const doc = new jsPDF();

    // Set up colors and fonts
    const primaryColor = [0, 61, 92]; // #003D5C
    const secondaryColor = [0, 85, 128]; // #005580

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('EcoWaste Management', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sustainable Business Solutions', 105, 30, { align: 'center' });

    // Invoice details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 60);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Number: INV-${bill.id}`, 20, 75);
    doc.text(`Date: ${bill.date}`, 20, 85);
    doc.text(`Payment ID: ${bill.paymentId || 'N/A'}`, 20, 95);

    // Bill details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill Details:', 20, 115);

    doc.setFont('helvetica', 'normal');
    doc.text(`Description: ${bill.description}`, 20, 130);
    doc.text(`Amount Paid: ₹${bill.paidAmount || bill.amount}`, 20, 145);
    doc.text(`Status: Paid`, 20, 160);

    // Business info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 120, 115);

    doc.setFont('helvetica', 'normal');
    doc.text(businessProfile.name, 120, 130);
    doc.text(businessProfile.type, 120, 140);
    doc.text(businessProfile.location, 120, 150);
    doc.text(businessProfile.email, 120, 160);

    // Footer
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 270, 210, 27, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Thank you for choosing EcoWaste Management for your sustainable waste solutions!', 105, 280, { align: 'center' });
    doc.text('For any queries, contact us at support@ecowaste.com', 105, 290, { align: 'center' });

    // Save the PDF
    doc.save(`Invoice-${bill.id}.pdf`);
  };

  // Referral Modal Component
  const ReferralModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={() => setShowReferralModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-3xl font-bold mb-2 text-center" style={{ color: '#003D5C' }}>Share & Earn Rewards! 🎁</h3>
        <p className="text-center text-gray-600 mb-6">Refer businesses and earn rewards together</p>
        
        <div style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }} className="rounded-xl p-6 text-white mb-6 shadow-lg">
          <p className="text-center text-sm mb-3 opacity-90">Your Unique Referral Code</p>
          <div className="bg-white rounded-lg p-4 text-center shadow-inner" style={{ color: '#003D5C' }}>
            <p className="text-4xl font-bold tracking-wider">{referralCode}</p>
          </div>
          <p className="text-center text-sm mt-3 opacity-90">
            Share this code and earn ₹500 for each successful referral!
          </p>
        </div>

        <div className="mb-6 border-2 rounded-xl p-6 bg-gray-50" style={{ borderColor: '#003D5C20' }}>
          <h4 className="font-semibold mb-4 text-center text-lg" style={{ color: '#003D5C' }}>QR Code for Easy Sharing</h4>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-6 rounded-xl shadow-lg referral-modal-qr">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Referral QR Code" style={{ width: '200px', height: '200px' }} />
              ) : (
                <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Loading QR...</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={downloadQRCode}
            className="w-full text-white py-3 rounded-lg transition flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}
          >
            <Download className="w-5 h-5" />
            Download QR Code
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <p className="font-semibold text-center mb-4 text-lg" style={{ color: '#003D5C' }}>Share via</p>
          <button
            onClick={() => shareReferral('whatsapp')}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md hover:shadow-lg"
          >
            📱 Share on WhatsApp
          </button>
          <button
            onClick={() => shareReferral('email')}
            className="w-full text-white py-3 rounded-lg transition font-semibold shadow-md hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}
          >
            📧 Share via Email
          </button>
          <button
            onClick={() => shareReferral('copy')}
            className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-semibold shadow-md hover:shadow-lg"
          >
            📋 Copy Referral Link
          </button>
        </div>

        <div className="rounded-xl p-5" style={{ background: '#003D5C10' }}>
          <h4 className="font-semibold mb-3" style={{ color: '#003D5C' }}>How It Works:</h4>
          <ol className="text-sm space-y-2 list-decimal list-inside text-gray-700">
            <li>Share your referral code with other businesses</li>
            <li>They sign up using your code</li>
            <li>You both get ₹500 discount on next service</li>
            <li>Earn unlimited rewards - no limit!</li>
          </ol>
        </div>
      </div>
    </div>
  );

  // Payment Modal Component
  const PaymentModal = () => {
    if (!selectedBill) return null;

    let ecoDiscount = Math.min(selectedBill.amount * 0.1, ecoWallet.discountBalance);
    let couponDiscount = 0;
    
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        couponDiscount = (selectedBill.amount * appliedCoupon.discount) / 100;
      } else {
        couponDiscount = appliedCoupon.discount;
      }
    }
    
    const totalDiscount = ecoDiscount + couponDiscount;
    const finalAmount = Math.max(selectedBill.amount - totalDiscount, 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
          {paymentSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-20 h-20 mx-auto mb-4" style={{ color: '#003D5C' }} />
              <h3 className="text-3xl font-bold mb-2" style={{ color: '#003D5C' }}>Payment Successful!</h3>
              <p className="text-gray-600">Your payment has been processed</p>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBill(null);
                  setAppliedCoupon(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#003D5C' }}>
                <CreditCard className="w-7 h-7" />
                Make Payment
              </h3>

              <div className="mb-6 rounded-xl p-5" style={{ background: '#003D5C10' }}>
                <p className="text-sm text-gray-600 mb-4">{selectedBill.description}</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Bill Amount:</span>
                    <span className="font-bold text-lg">₹{selectedBill.amount}</span>
                  </div>
                  {ecoDiscount > 0 && (
                    <div className="flex justify-between items-center" style={{ color: '#003D5C' }}>
                      <span className="font-medium">Eco Wallet Discount:</span>
                      <span className="font-bold">-₹{ecoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-purple-600">
                      <span className="font-medium">Coupon ({appliedCoupon.code}):</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">-₹{couponDiscount.toFixed(2)}</span>
                        <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold border-t-2 pt-3 mt-3" style={{ color: '#003D5C', borderColor: '#003D5C20' }}>
                    <span>Total Payable:</span>
                    <span>₹{finalAmount.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <p className="text-sm text-center font-semibold mt-2" style={{ color: '#003D5C' }}>
                      You saved ₹{totalDiscount.toFixed(2)}! 🎉
                    </p>
                  )}
                </div>
                
                {!appliedCoupon && (
                  <div className="mt-5 pt-5 border-t-2" style={{ borderColor: '#003D5C20' }}>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#003D5C' }}>Have a coupon code?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2 border-2 rounded-lg text-sm uppercase font-semibold focus:outline-none focus:ring-2"
                        style={{ borderColor: '#003D5C40', '--tw-ring-color': '#003D5C' }}
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 text-sm font-bold transition shadow-md"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-4" style={{ color: '#003D5C' }}>Select Payment Method</label>
                <div className="space-y-3">
                  {[
                    { value: 'razorpay', title: 'Razorpay', desc: 'Cards, UPI, Netbanking, Wallets' },
                    { value: 'upi', title: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
                    { value: 'stripe', title: 'Stripe', desc: 'International Cards' },
                    { value: 'paypal', title: 'PayPal', desc: 'PayPal Balance or Card' }
                  ].map((method) => (
                    <label key={method.value} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:shadow-md transition" style={{ borderColor: paymentMethod === method.value ? '#003D5C' : '#E5E7EB', background: paymentMethod === method.value ? '#003D5C10' : 'white' }}>
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4 w-5 h-5"
                        style={{ accentColor: '#003D5C' }}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-lg" style={{ color: '#003D5C' }}>{method.title}</p>
                        <p className="text-sm text-gray-600">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={processPayment}
                disabled={paymentProcessing}
                className="w-full text-white py-4 rounded-lg transition font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: paymentProcessing ? '#94A3B8' : 'linear-gradient(135deg, #003D5C, #005580)' }}
              >
                {paymentProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${finalAmount.toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Your payment information is secure and encrypted
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Award, label: 'Eco Points', value: ecoWallet.points, color: '#003D5C' },
          { icon: DollarSign, label: 'Discount Balance', value: `₹${ecoWallet.discountBalance}`, color: '#16A34A' },
          { icon: Leaf, label: 'CO₂ Saved', value: `${ecoWallet.co2Saved}kg`, color: '#059669' },
          { icon: Trash2, label: 'Total Pickups', value: pickups.length, color: '#0284C7' }
        ].map((stat, idx) => (
          <div key={idx} className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105" style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}CC)` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="w-14 h-14 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#003D5C' }}>
            <BarChart3 className="w-6 h-6" />
            Monthly Waste Collection
          </h3>
          <div className="space-y-4">
            {[
              { type: 'Recyclable', weight: 45, percent: 60, color: '#2fa7e4ff' },
              { type: 'Organic', weight: 30, percent: 40, color: '#238dcaff' },
              { type: 'Electronic', weight: 15, percent: 20, color: '#338bd3ff' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{item.type}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.weight}kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div className="h-3 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${item.percent}%`, background: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#003D5C' }}>
            <CreditCard className="w-6 h-6" />
            Payment Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200 hover:shadow-md transition">
              <span className="text-sm font-semibold text-gray-700">Pending Bills</span>
              <span className="text-2xl font-bold text-orange-600">₹{bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg border-2 hover:shadow-md transition" style={{ background: '#003D5C10', borderColor: '#003D5C40' }}>
              <span className="text-sm font-semibold text-gray-700">Paid This Month</span>
              <span className="text-2xl font-bold" style={{ color: '#003D5C' }}>₹{bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.paidAmount || b.amount), 0)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200 hover:shadow-md transition">
              <span className="text-sm font-semibold text-gray-700">Eco Discount</span>
              <span className="text-2xl font-bold text-green-600">₹{ecoWallet.discountBalance}</span>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="w-full text-white py-3 rounded-lg font-bold transition shadow-md hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}
            >
              View All Payments
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
        <h3 className="text-xl font-bold mb-5" style={{ color: '#003D5C' }}>Recent Pickups</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={{ borderColor: '#003D5C20' }}>
                <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Date</th>
                <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Type</th>
                <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Weight</th>
                <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Status</th>
                <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {pickups.slice(-5).reverse().map(pickup => (
                <tr key={pickup.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-4 px-4 font-medium">{pickup.date}</td>
                  <td className="py-4 px-4">{pickup.type}</td>
                  <td className="py-4 px-4 font-semibold">{pickup.weight}kg</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      pickup.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pickup.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold" style={{ color: '#003D5C' }}>+{pickup.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Schedule Pickup View
  const SchedulePickupView = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{ color: '#003D5C' }}>
        <Calendar className="w-8 h-8" />
        Schedule Waste Pickup
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-8 mb-8">
        <div>
          <label className="block text-sm font-bold mb-3" style={{ color: '#003D5C' }}>Pickup Date</label>
          <input
            type="date"
            value={newPickup.date}
            onChange={(e) => setNewPickup({...newPickup, date: e.target.value})}
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 font-semibold"
            style={{ borderColor: '#003D5C40' }}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-3" style={{ color: '#003D5C' }}>Frequency</label>
          <select
            value={newPickup.frequency}
            onChange={(e) => setNewPickup({...newPickup, frequency: e.target.value})}
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 font-semibold"
            style={{ borderColor: '#003D5C40' }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-3" style={{ color: '#003D5C' }}>Waste Category</label>
          <select
            value={newPickup.wasteType}
            onChange={(e) => setNewPickup({...newPickup, wasteType: e.target.value})}
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 font-semibold"
            style={{ borderColor: '#003D5C40' }}
          >
            <option value="organic">Organic</option>
            <option value="recyclable">Recyclable</option>
            <option value="electronic">Electronic</option>
            <option value="hazardous">Hazardous</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-3" style={{ color: '#003D5C' }}>Branch/Location</label>
          <select
            value={newPickup.branch}
            onChange={(e) => setNewPickup({...newPickup, branch: e.target.value})}
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 font-semibold"
            style={{ borderColor: '#003D5C40' }}
          >
            <option value="main">Main Office - Madurai</option>
            <option value="branch1">Branch 1 - Chennai</option>
            <option value="branch2">Branch 2 - Coimbatore</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-3" style={{ color: '#003D5C' }}>Waste Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={newPickup.wasteCount}
              onChange={(e) => setNewPickup({ ...newPickup, wasteCount: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              min="1"
              className="w-2/3 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 font-semibold"
              style={{ borderColor: '#003D5C40' }}
            />
            <select
              value={newPickup.wasteUnit}
              onChange={(e) => setNewPickup({ ...newPickup, wasteUnit: e.target.value })}
              className="w-1/3 px-2 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 font-semibold"
              style={{ borderColor: '#003D5C40' }}
            >
              <option value="bins/bags">bins/bags</option>
              <option value="kg">kg</option>
              <option value="ton">ton</option>
            </select>
          </div>
        </div>
      </div>
      <button
        onClick={handleSchedulePickup}
        className="w-full text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}
      >
        Schedule Pickup
      </button>
    </div>
  );

  // Payments View
  const PaymentsView = () => {
    const pendingBills = bills.filter(b => b.status === 'pending');
    const paidBills = bills.filter(b => b.status === 'paid');
    const totalPending = pendingBills.reduce((sum, b) => sum + b.amount, 0);
    const totalPaid = paidBills.reduce((sum, b) => sum + (b.paidAmount || b.amount), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #136094ff, #11649bff)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Pending</p>
                <p className="text-3xl font-bold">₹{totalPending.toLocaleString()}</p>
              </div>
              <CreditCard className="w-14 h-14 opacity-80" />
            </div>
          </div>

          <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Paid This Month</p>
                <p className="text-3xl font-bold">₹{totalPaid.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-14 h-14 opacity-80" />
            </div>
          </div>

          <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #1658a3ff, #2070bbff)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Eco Discount</p>
                <p className="text-3xl font-bold">₹{ecoWallet.discountBalance}</p>
              </div>
              <Award className="w-14 h-14 opacity-80" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: '#003D5C' }}>Auto-Pay Settings</h3>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoPayEnabled}
                  onChange={(e) => setAutoPayEnabled(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-16 h-8 rounded-full transition shadow-inner ${autoPayEnabled ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition shadow-md ${autoPayEnabled ? 'transform translate-x-8' : ''}`}></div>
              </div>
              <span className="ml-3 text-sm font-bold" style={{ color: autoPayEnabled ? '#003D5C' : '#6B7280' }}>{autoPayEnabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>
          <p className="text-sm text-gray-600 font-medium">Automatically pay bills on due date using your preferred payment method</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-6" style={{ color: '#003D5C' }}>Pending Bills</h3>
          {pendingBills.length === 0 ? (
            <p className="text-gray-500 text-center py-12 font-medium">No pending bills</p>
          ) : (
            <div className="space-y-4">
              {pendingBills.map(bill => (
                <div key={bill.id} className="border-2 rounded-xl p-5 hover:shadow-lg transition" style={{ borderColor: '#003D5C20' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg" style={{ color: '#003D5C' }}>{bill.description}</p>
                      <p className="text-sm text-gray-600 font-medium mt-1">Due: {bill.dueDate}</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">₹{bill.amount}</span>
                  </div>
                  <button
                    onClick={() => openPaymentModal(bill)}
                    className="w-full text-white py-3 rounded-lg font-bold transition shadow-md hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}
                  >
                    Pay Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-6" style={{ color: '#003D5C' }}>Payment History</h3>
          {paidBills.length === 0 ? (
            <p className="text-gray-500 text-center py-12 font-medium">No payment history</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: '#003D5C40' }}>
                    <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Date</th>
                    <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Description</th>
                    <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Amount</th>
                    <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Status</th>
                    <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paidBills.map(bill => (
                    <tr key={bill.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4 px-4 font-medium">{bill.date}</td>
                      <td className="py-4 px-4">{bill.description}</td>
                      <td className="py-4 px-4 font-bold" style={{ color: '#003D5C' }}>₹{bill.paidAmount || bill.amount}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#003D5C20', color: '#003D5C' }}>
                          Paid
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => downloadInvoice(bill)}
                          className="flex items-center gap-2 text-sm font-bold hover:underline transition"
                          style={{ color: '#003D5C' }}
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Referral & Coupons View
  const ReferralView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #134f88ff, #0c4070ff)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Referrals</p>
              <p className="text-3xl font-bold">{referrals.length}</p>
            </div>
            <Share2 className="w-14 h-14 opacity-80" />
          </div>
        </div>

        <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #27a4dfff, #2da5ebff)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Earned Rewards</p>
              <p className="text-3xl font-bold">₹{referrals.reduce((sum, r) => sum + r.discount, 0)}</p>
            </div>
            <DollarSign className="w-14 h-14 opacity-80" />
          </div>
        </div>

        <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #093864ff, #0e3057ff)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Active Coupons</p>
              <p className="text-3xl font-bold">{coupons.filter(c => c.status === 'active').length}</p>
            </div>
            <Tag className="w-14 h-14 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold" style={{ color: '#003D5C' }}>Referral Program</h3>
            <p className="text-sm text-gray-600 font-medium mt-1">Earn ₹500 for every successful referral</p>
          </div>
          <button
            onClick={() => setShowReferralModal(true)}
            className="text-white px-6 py-3 rounded-lg font-bold transition shadow-lg hover:shadow-xl flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}
          >
            <Gift className="w-5 h-5" />
            Share & Earn
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-4 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition" style={{ borderColor: '#003D5C', background: '#003D5C10' }}>
            <h4 className="font-bold text-lg mb-3" style={{ color: '#003D5C' }}>Your Referral Code</h4>
            <div className="bg-white rounded-xl p-5 mb-4 border-2 shadow-inner" style={{ borderColor: '#003D5C40' }}>
              <p className="text-4xl font-bold tracking-wider" style={{ color: '#003D5C' }}>{referralCode}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralCode);
                alert('✅ Referral code copied!');
              }}
              className="text-sm hover:underline font-bold"
              style={{ color: '#003D5C' }}
            >
              📋 Click to Copy Code
            </button>
          </div>

          <div className="border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition" style={{ borderColor: '#003D5C20', background: 'linear-gradient(135deg, #003D5C10, #16A34A10)' }}>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#003D5C' }}>
              <Gift className="w-6 h-6" />
              Referral Benefits
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                '₹500 discount for you on each referral',
                '₹500 discount for referred client',
                'Unlimited referrals allowed',
                'Instant reward activation'
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#003D5C' }} />
                  <span className="font-medium text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#003D5C' }}>
          <Tag className="w-7 h-7" />
          Available Coupons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {coupons.filter(c => c.status === 'active').map(coupon => (
            <div key={coupon.id} className="border-4 border-dashed rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105" style={{ borderColor: '#0b4485ff', background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-3xl font-bold text-orange-600">{coupon.code}</p>
                  <p className="text-sm font-bold text-gray-700 mt-1">
                    {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.code);
                    alert('✅ Coupon code copied!');
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-xs font-bold transition shadow-md"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-600 font-medium mt-3">Valid until: {coupon.expiryDate}</p>
              <p className="text-xs text-gray-600 font-medium">Used: {coupon.usedCount} times</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-5" style={{ background: '#003D5C10' }}>
          <p className="text-sm text-gray-700 font-medium">
            💡 <strong>Pro Tip:</strong> Apply coupons during payment to stack discounts with your Eco Wallet!
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
        <h3 className="text-2xl font-bold mb-6" style={{ color: '#003D5C' }}>Your Referral History</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-16">
            <Share2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6 font-medium text-lg">No referrals yet. Start sharing your code!</p>
            <button
              onClick={() => setShowReferralModal(true)}
              className="text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition"
              style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}
            >
              Share Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2" style={{ borderColor: '#003D5C40' }}>
                  <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Business Name</th>
                  <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Date Joined</th>
                  <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Status</th>
                  <th className="text-left py-3 px-4 font-bold" style={{ color: '#003D5C' }}>Your Reward</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(referral => (
                  <tr key={referral.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-4 px-4 font-semibold">{referral.name}</td>
                    <td className="py-4 px-4 font-medium">{referral.date}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#003D5C20', color: '#003D5C' }}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-green-600 text-lg">+₹{referral.discount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Rewards View
  const RewardsView = () => (
    <div className="space-y-6">
      <div className="rounded-xl shadow-xl p-10 text-white" style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}>
        <h2 className="text-4xl font-bold mb-3">Eco Wallet</h2>
        <p className="opacity-90 mb-8 text-lg">Your sustainable rewards balance</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-20 rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <p className="text-sm opacity-90 mb-2">Available Points</p>
            <p className="text-4xl font-bold">{ecoWallet.points}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <p className="text-sm opacity-90 mb-2">Discount Balance</p>
            <p className="text-4xl font-bold">₹{ecoWallet.discountBalance}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <p className="text-sm opacity-90 mb-2">CO₂ Impact</p>
            <p className="text-4xl font-bold">{ecoWallet.co2Saved}kg</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#003D5C' }}>
            <Award className="w-7 h-7" />
            Rewards Milestones
          </h3>
          <div className="space-y-5">
            <div className="border-l-4 pl-5 py-3 shadow-sm rounded-r-lg" style={{ borderColor: '#0f5583ff', background: '#16A34A10' }}>
              <p className="font-bold text-lg" style={{ color: '#003D5C' }}>100kg Milestone Reached! 🎉</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Earned 10% discount on next pickup</p>
            </div>
            <div className="border-l-4 pl-5 py-3 shadow-sm rounded-r-lg" style={{ borderColor: '#0f5583ff', background: '#003D5C10' }}>
              <p className="font-bold text-lg" style={{ color: '#003D5C' }}>Perfect Segregation Streak</p>
              <p className="text-sm text-gray-600 font-medium mt-1">5 pickups in a row - Bonus 50 points!</p>
            </div>
            <div className="border-l-4 pl-5 py-3 shadow-sm rounded-r-lg" style={{ borderColor: '#0f5583ff', background: '#9333EA10' }}>
              <p className="font-bold text-lg text-purple-700">Next Milestone: 200kg</p>
              <p className="text-sm text-gray-600 font-medium mt-2 mb-3">Progress: 90kg / 200kg (45%)</p>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div className="h-3 rounded-full transition-all duration-500 shadow-sm" style={{ width: '45%', background: 'linear-gradient(90deg, #115175ff, #0e3868ff)' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#003D5C' }}>
            <Heart className="w-7 h-7 text-red-500" />
            Donate to NGOs
          </h3>
          <p className="text-gray-600 mb-6 font-medium">Convert your points to support environmental causes</p>
          <div className="space-y-4">
            <div className="border-2 rounded-xl p-5 shadow-md hover:shadow-lg transition" style={{ borderColor: '#003D5C20' }}>
              <p className="font-bold text-lg" style={{ color: '#003D5C' }}>Green Earth Foundation</p>
              <p className="text-sm text-gray-600 font-medium mb-4 mt-1">Ocean cleanup initiatives</p>
              <button
                onClick={() => handleDonatePoints(50)}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold transition shadow-md hover:shadow-lg w-full"
              >
                Donate 50 Points
              </button>
            </div>
            <div className="border-2 rounded-xl p-5 shadow-md hover:shadow-lg transition" style={{ borderColor: '#003D5C20' }}>
              <p className="font-bold text-lg" style={{ color: '#003D5C' }}>Clean City Initiative</p>
              <p className="text-sm text-gray-600 font-medium mb-4 mt-1">Urban waste management</p>
              <button
                onClick={() => handleDonatePoints(100)}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold transition shadow-md hover:shadow-lg w-full"
              >
                Donate 100 Points
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Profile View
  const ProfileView = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{ color: '#003D5C' }}>
        <Building2 className="w-8 h-8" />
        Business Profile
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: 'Company Name', value: businessProfile.name },
          { label: 'Business Type', value: businessProfile.type },
          { label: 'Location', value: businessProfile.location },
          { label: 'Contact', value: businessProfile.contact },
          { label: 'Email', value: businessProfile.email }
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-bold mb-3" style={{ color: '#003D5C' }}>{field.label}</label>
            <input
              type="text"
              value={field.value}
              readOnly
              className="w-full px-4 py-3 border-2 rounded-lg font-semibold bg-gray-50 focus:outline-none"
              style={{ borderColor: '#003D5C40', color: '#003D5C' }}
            />
          </div>
        ))}
      </div>
      <div className="rounded-xl p-6 shadow-md" style={{ background: '#003D5C10' }}>
        <h3 className="font-bold text-lg mb-3" style={{ color: '#003D5C' }}>Branch Management</h3>
        <p className="text-sm text-gray-600 font-medium mb-4">Total Branches: {businessProfile.branches}</p>
        <button className="text-white px-6 py-3 rounded-lg font-bold transition shadow-md hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}>
          + Add New Branch
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' }}>
      {/* Header */}
      <div className="shadow-lg" style={{ background: 'linear-gradient(135deg, #003D5C, #005580)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Leaf className="w-9 h-9" />
                EcoWaste Management
              </h1>
              <p className="text-white opacity-90 mt-1 font-medium">Sustainable Business Solutions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="relative p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition">
                  <Bell className="w-6 h-6 text-white" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
              <div className="text-right mr-2">
                <p className="text-white font-bold">{businessProfile.name}</p>
                <p className="text-white text-sm opacity-90">{businessProfile.email}</p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('home')}
                className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition"
                title="Logout"
              >
                <LogOut className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'schedule', label: 'Schedule Pickup', icon: Calendar },
              { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
              { id: 'referrals', label: 'Referrals & Coupons', icon: Gift },
              { id: 'rewards', label: 'Rewards & Donations', icon: Award },
              { id: 'profile', label: 'Profile', icon: Building2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-bold whitespace-nowrap transition transform hover:scale-105 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #003D5C, #005580)' } : {}}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'schedule' && <SchedulePickupView />}
          {activeTab === 'payments' && <PaymentsView />}
          {activeTab === 'referrals' && <ReferralView />}
          {activeTab === 'rewards' && <RewardsView />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && <PaymentModal />}
      {showReferralModal && <ReferralModal />}
    </div>
  );
};

export default BusinessUserDashboard;