import React, { useState, useEffect } from "react";
import ProfileSettings from "./ProfileSettings";
import ComplaintSystem from "./ComplaintSystem";

function UserDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState(3);
  const [user, setUser] = useState({ name: 'User' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userPickups, setUserPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(false);
  const [stats, setStats] = useState({
    completedPickups: 0,
    pendingRequests: 0,
    wasteRecycled: 0,
    rewardsEarned: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState("");
  
  // Form state
  const [pickupForm, setPickupForm] = useState({
    address: '',
    name: '',
    email: '',
    phone: '',
    wasteType: 'general',
    date: '',
    time: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user data and pre-fill the form
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user/profile'); // Assuming this endpoint exists
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setPickupForm(prev => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || ''
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch user-specific pickups when the 'track' or 'overview' tab is active
  useEffect(() => {
    const fetchUserPickups = async () => {
      if (activeTab === 'track' || activeTab === 'overview') {
        setLoadingPickups(true);
        try {
          const res = await fetch('/api/pickups/my-pickups'); // Assumes a protected route that returns pickups for the logged-in user
          if (!res.ok) {
            throw new Error('Failed to fetch pickup history.');
          }
          const data = await res.json();
          const pickups = data.map(p => ({ ...p, id: p._id }));

          setUserPickups(pickups);

          // Calculate stats from pickups
          const completedPickups = pickups.filter(p => p.status?.toLowerCase() === 'completed').length;
          const pendingRequests = pickups.filter(p => p.status?.toLowerCase() === 'pending').length;
          const wasteRecycled = pickups
            .filter(p => p.status?.toLowerCase() === 'completed')
            .reduce((total, p) => total + (p.wasteAmount || 0), 0); // Assuming wasteAmount field exists
          const rewardsEarned = completedPickups * 20; // Example: 20 points per completed pickup

          setStats({
            completedPickups,
            pendingRequests,
            wasteRecycled,
            rewardsEarned
          });

          // Generate recent activities from pickups
          const activities = [];
          const sortedPickups = pickups.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

          sortedPickups.slice(0, 3).forEach(pickup => {
            if (pickup.status?.toLowerCase() === 'completed') {
              activities.push({
                icon: '✅',
                text: `${pickup.wasteType} waste pickup completed`,
                time: pickup.completedAt ? new Date(pickup.completedAt).toLocaleString() : 'Recently'
              });
            } else if (pickup.status?.toLowerCase() === 'scheduled' || pickup.status?.toLowerCase() === 'assigned') {
              activities.push({
                icon: '📅',
                text: `${pickup.wasteType} waste pickup scheduled`,
                time: pickup.date ? new Date(pickup.date).toLocaleDateString() : 'Upcoming'
              });
            } else if (pickup.status?.toLowerCase() === 'pending') {
              activities.push({
                icon: '⏳',
                text: `${pickup.wasteType} waste pickup requested`,
                time: 'Pending'
              });
            }
          });

          // Add reward activity if completed pickups exist
          if (completedPickups > 0) {
            activities.push({
              icon: '💰',
              text: 'Reward points credited',
              time: 'Recently'
            });
          }

          setRecentActivities(activities.slice(0, 3)); // Limit to 3 activities

        } catch (error) {
          console.error(error.message);
        } finally {
          setLoadingPickups(false);
        }
      }
    };
    fetchUserPickups();
  }, [activeTab]);

  const handleFormChange = (field, value) => {
    setPickupForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitPickup = async (e) => {
    e.preventDefault();
    if (!selectedServiceType) {
      alert('Please select a service type (Home or Business)');
      return;
    }

    const pickupData = {
      ...pickupForm,
      serviceType: selectedServiceType,
      userName: pickupForm.name, // Align with what PickupAssignment expects
      location: pickupForm.address,
      userPhone: pickupForm.phone,
      status: 'pending', // Default status
      priority: 'medium' // Default priority
    };

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/pickups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the auth token
        },
        body: JSON.stringify(pickupData),
      });
      if (!response.ok) throw new Error('Failed to submit pickup request.');
      alert('Pickup request submitted successfully! You can track its status in the "Track Status" tab.');
    } catch (error) {
      alert(error.message);
    }
  };

  const getProgressFromStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 100;
      case 'in-progress':
        return 75;
      case 'assigned':
      case 'scheduled':
        return 25;
      default: // 'pending' or 'cancelled'
        return 10;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div style={styles.overviewGrid}>
            <div style={styles.statsCard}>
              <h3 style={styles.cardTitle}>Quick Stats</h3>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{stats.completedPickups}</span>
                <span style={styles.statLabel}>Pickups Completed</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{stats.pendingRequests}</span>
                <span style={styles.statLabel}>Pending Requests</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{stats.wasteRecycled} kg</span>
                <span style={styles.statLabel}>Waste Recycled</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>₹{stats.rewardsEarned}</span>
                <span style={styles.statLabel}>Rewards Earned</span>
              </div>
            </div>

            <div style={styles.recentActivity}>
              <h3 style={styles.cardTitle}>Recent Activity</h3>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} style={styles.activityItem}>
                    <span style={styles.activityIcon}>{activity.icon}</span>
                    <div>
                      <div style={styles.activityText}>{activity.text}</div>
                      <div style={styles.activityTime}>{activity.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#4A5568' }}>
                  No recent activities
                </div>
              )}
            </div>

            <div style={styles.upcomingPickups}>
              <h3 style={styles.cardTitle}>Upcoming Pickups</h3>
              {userPickups.filter(p => p.status?.toLowerCase() === 'scheduled' || p.status?.toLowerCase() === 'assigned').length > 0 ? (
                userPickups
                  .filter(p => p.status?.toLowerCase() === 'scheduled' || p.status?.toLowerCase() === 'assigned')
                  .slice(0, 2)
                  .map((pickup) => {
                    const pickupDate = new Date(pickup.date);
                    return (
                      <div key={pickup.id} style={styles.pickupItem}>
                        <div style={styles.pickupDate}>
                          <div style={styles.dateNumber}>{pickupDate.getDate()}</div>
                          <div style={styles.dateMonth}>{pickupDate.toLocaleString('default', { month: 'short' })}</div>
                        </div>
                        <div style={styles.pickupDetails}>
                          <div style={styles.pickupType}>{pickup.wasteType}</div>
                          <div style={styles.pickupTime}>{pickup.time || 'TBD'}</div>
                          <div style={styles.pickupStatus}>{pickup.status}</div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#4A5568' }}>
                  No upcoming pickups
                </div>
              )}
            </div>
          </div>
        );

      case "pickup":
        return (
          <div style={styles.pickupContainer}>
            <div style={styles.pickupFormCard}>
              <div style={styles.formHeader}>
                <h2 style={styles.formTitle}>Choose Your Waste Solution</h2>
                <p style={styles.formSubtitle}>Enter your information to start service or get a quote.</p>
                
                {/* Progress Dots */}
                <div style={styles.progressDots}>
                  <div style={{...styles.dot, ...styles.activeDot}}></div>
                  <div style={styles.dot}></div>
                  <div style={styles.dot}></div>
                  <div style={styles.dot}></div>
                </div>
              </div>

              {/* Service Type Selection */}
              <div style={styles.serviceTypeContainer}>
                <div 
                  style={{
                    ...styles.serviceTypeCard,
                    ...(selectedServiceType === 'home' ? styles.selectedServiceCard : {})
                  }}
                  onClick={() => setSelectedServiceType('home')}
                >
                  <div style={styles.serviceIcon}>🏠</div>
                  <div style={styles.serviceTypeText}>
                    <div style={styles.serviceTypeTitle}>For Your Home</div>
                  </div>
                  <div style={{
                    ...styles.checkbox,
                    ...(selectedServiceType === 'home' ? styles.checkedCheckbox : {})
                  }}>
                    {selectedServiceType === 'home' && '✓'}
                  </div>
                </div>

                <div 
                  style={{
                    ...styles.serviceTypeCard,
                    ...(selectedServiceType === 'business' ? styles.selectedServiceCard : {})
                  }}
                  onClick={() => setSelectedServiceType('business')}
                >
                  <div style={styles.serviceIcon}>🏪</div>
                  <div style={styles.serviceTypeText}>
                    <div style={styles.serviceTypeTitle}>For Business</div>
                    <div style={styles.serviceTypeSubtitle}>& Organizations</div>
                  </div>
                  <div style={{
                    ...styles.checkbox,
                    ...(selectedServiceType === 'business' ? styles.checkedCheckbox : {})
                  }}>
                    {selectedServiceType === 'business' && '✓'}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmitPickup} style={styles.form}>
                {/* Address Field */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Address</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>📍</span>
                    <input 
                      type="text"
                      style={styles.formInput}
                      placeholder="e.g. 123 Main Street, NW, New York"
                      value={pickupForm.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Name Fields */}
                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Full Name</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>👤</span>
                      <input 
                        type="text"
                        style={styles.formInput}
                        placeholder="e.g. John Doe"
                        value={pickupForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                {/* Email and Phone Fields */}
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Email</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>✉️</span>
                      <input 
                        type="email"
                        style={styles.formInput}
                        placeholder="e.g. smith@myemail.com"
                        value={pickupForm.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Phone</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>📞</span>
                      <input 
                        type="tel"
                        style={styles.formInput}
                        placeholder="e.g. 205-555-0168"
                        value={pickupForm.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Waste Type and Date/Time */}
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Waste Type</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>♻️</span>
                      <select
                        style={{...styles.formInput, paddingLeft: '45px'}}
                        value={pickupForm.wasteType}
                        onChange={(e) => handleFormChange('wasteType', e.target.value)}
                        required
                      >
                        <option value="general">General Waste</option>
                        <option value="recyclable">Recyclable</option>
                        <option value="organic">Organic</option>
                        <option value="electronic">Electronic</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Preferred Date</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>📅</span>
                      <input 
                        type="date"
                        style={styles.formInput}
                        value={pickupForm.date}
                        onChange={(e) => handleFormChange('date', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Preferred Time</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>⏰</span>
                      <input 
                        type="time"
                        style={styles.formInput}
                        value={pickupForm.time}
                        onChange={(e) => handleFormChange('time', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" style={styles.submitButton}>
                  Request Pickup
                </button>

                {/* reCAPTCHA Notice */}
                <div style={styles.recaptchaNotice}>
                  🔒 This site is protected by reCAPTCHA and the Google{' '}
                  <span style={styles.termsLink}>Privacy Policy</span> and{' '}
                  <span style={styles.termsLink}>Terms of Service</span> apply.
                </div>
              </form>
            </div>
          </div>
        );

      case "track":
        return (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Track Your Pickups</h2>
              <p style={styles.sectionDescription}>
                Monitor the real-time status of your waste collection requests
              </p>
            </div>

            {loadingPickups ? (
              <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#003D5C' }}>Loading your pickups...</div>
            ) : userPickups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#4A5568' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚛</div>
                <h3 style={{ fontSize: '1.5rem', color: '#003D5C' }}>No Pickups Found</h3>
                <p>You haven't requested any pickups yet. Go to the "Request Pickup" tab to schedule your first one!</p>
              </div>
            ) : (
              <div style={styles.trackingList}>
                {userPickups.map((pickup) => {
                  const progress = getProgressFromStatus(pickup.status);
                  return (
                    <div key={pickup.id} style={styles.trackingCard}>
                      <div style={styles.trackingHeader}>
                        <div style={styles.trackingId}>#{pickup.id.slice(-6).toUpperCase()}</div>
                        <div style={{...styles.trackingStatus, 
                          backgroundColor: pickup.status === 'Completed' ? '#2E7D32' : 
                                         pickup.status === 'In Progress' ? '#FF9800' : 
                                         pickup.status === 'Assigned' || pickup.status === 'Scheduled' ? '#003D5C' : '#9E9E9E'
                        }}>
                          {pickup.status}
                        </div>
                      </div>
                      <div style={styles.trackingContent}>
                        <div style={styles.trackingDetails}>
                          <h4 style={styles.trackingType}>{pickup.wasteType}</h4>
                          <p style={styles.trackingInfo}>Driver: {pickup.driver || 'Not Assigned'}</p>
                          <p style={styles.trackingInfo}>Time: {pickup.time || new Date(pickup.date).toLocaleDateString()}</p>
                        </div>
                        <div style={styles.progressContainer}>
                          <div style={styles.progressBar}>
                            <div style={{...styles.progressFill, width: `${progress}%`}}></div>
                          </div>
                          <span style={styles.progressText}>{progress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );


      case "complaints":
        return (
          <ComplaintSystem onBack={() => setActiveTab('overview')} user={user} />
        );

      case "profile":
        return (
          <ProfileSettings user={user} />
        );

      default:
        return null;
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f4f8 0%, #d4e9f2 100%)',
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },

    header: {
      background: 'linear-gradient(135deg, #003D5C, #005580)',
      color: 'white',
      padding: '20px 30px',
      boxShadow: '0 4px 20px rgba(0, 61, 92, 0.3)'
    },

    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },

    welcomeText: {
      fontSize: '1.8rem',
      fontWeight: '700',
      margin: 0
    },

    userTypeBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      background: user.userType === 'business' ? '#FF9800' : '#4CAF50',
      color: 'white',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      marginLeft: '15px'
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },

    timeDisplay: {
      fontSize: '0.9rem',
      opacity: 0.9
    },

    notificationBell: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      padding: '10px',
      borderRadius: '50%',
      cursor: 'pointer',
      position: 'relative'
    },

    notificationBadge: {
      position: 'absolute',
      top: '0',
      right: '0',
      background: '#FF5722',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      fontSize: '0.7rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    nav: {
      display: 'flex',
      gap: '5px',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '5px',
      borderRadius: '12px'
    },

    navButton: {
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      background: 'transparent',
      color: 'rgba(255, 255, 255, 0.8)',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      fontSize: '0.9rem'
    },

    activeNavButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      fontWeight: '600'
    },

    content: {
      padding: '30px',
      width: '100%',
      maxWidth:'none',
      margin: '0'
    },

    // Pickup Form Styles
    pickupContainer: {
      display: 'flex',
      justifyContent: 'center',
      padding: '20px'
    },

    pickupFormCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '40px',
      maxWidth: '800px',
      width: '100%',
      boxShadow: '0 10px 40px rgba(0, 61, 92, 0.1)'
    },

    formHeader: {
      textAlign: 'center',
      marginBottom: '40px'
    },

    formTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '10px'
    },

    formSubtitle: {
      color: '#666',
      fontSize: '1rem',
      marginBottom: '30px'
    },

    progressDots: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '20px'
    },

    dot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: '#ddd'
    },

    activeDot: {
      background: '#1c567cff'
    },

    serviceTypeContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '30px'
    },

    serviceTypeCard: {
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },

    selectedServiceCard: {
      borderColor: '#003D5C',
      background: '#f0f8ff'
    },

    serviceIcon: {
      fontSize: '2rem'
    },

    serviceTypeText: {
      flex: 1
    },

    serviceTypeTitle: {
      fontWeight: '600',
      color: '#1a1a1a',
      fontSize: '1.1rem'
    },

    serviceTypeSubtitle: {
      fontSize: '0.9rem',
      color: '#666'
    },

    checkbox: {
      width: '24px',
      height: '24px',
      border: '2px solid #ccc',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      color: 'white'
    },

    checkedCheckbox: {
      background: '#003D5C',
      borderColor: '#003D5C'
    },

    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },

    formLabel: {
      fontWeight: '600',
      color: '#1a1a1a',
      fontSize: '0.95rem'
    },

    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },

    inputIcon: {
      position: 'absolute',
      left: '15px',
      fontSize: '1.2rem'
    },

    formInput: {
      width: '100%',
      padding: '12px 15px 12px 45px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none'
    },

    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },

    termsContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginTop: '10px'
    },

    termsCheckbox: {
      width: '18px',
      height: '18px',
      marginTop: '2px',
      cursor: 'pointer'
    },

    termsLabel: {
      fontSize: '0.9rem',
      color: '#666',
      lineHeight: 1.5
    },

    termsLink: {
      color: '#003D5C',
      fontWeight: '500',
      cursor: 'pointer'
    },

    submitButton: {
      padding: '15px',
      background: '#1f5b8dff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px'
    },

    recaptchaNotice: {
      textAlign: 'center',
      fontSize: '0.8rem',
      color: '#999',
      marginTop: '20px',
      lineHeight: 1.6
    },

    // Other existing styles...
    overviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px',
      marginBottom: '30px',
      width: '100%'

    },

    statsCard: {
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 61, 92, 0.1)'
    },

    cardTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: '20px',
      borderBottom: '2px solid #E2E8F0',
      paddingBottom: '10px'
    },

    statItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 0',
      borderBottom: '1px solid #F7FAFC'
    },

    statNumber: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#003D5C'
    },

    statLabel: {
      color: '#4A5568',
      fontWeight: '500'
    },

    recentActivity: {
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
    },

    activityItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '15px',
      padding: '15px 0',
      borderBottom: '1px solid #F7FAFC'
    },

    activityIcon: {
      fontSize: '1.2rem',
      marginTop: '2px'
    },

    activityText: {
      fontWeight: '500',
      color: '#2D3748',
      marginBottom: '5px'
    },

    activityTime: {
      fontSize: '0.8rem',
      color: '#718096'
    },
 
    upcomingPickups: {
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
    },

    pickupItem: {
      display: 'flex',
      gap: '15px',
      padding: '15px 0',
      borderBottom: '1px solid #F7FAFC'
    },

    pickupDate: {
      background: 'linear-gradient(135deg, #003D5C, #005580)',
      color: 'white',
      padding: '10px',
      borderRadius: '12px',
      textAlign: 'center',
      minWidth: '60px'
    },

    dateNumber: {
      fontSize: '1.5rem',
      fontWeight: '700'
    },

    dateMonth: {
      fontSize: '0.8rem',
      opacity: 0.9
    },

    pickupDetails: {
      flex: 1
    },

    pickupType: {
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '5px'
    },

    pickupTime: {
      color: '#4A5568',
      fontSize: '0.9rem',
      marginBottom: '5px'
    },

    pickupStatus: {
      display: 'inline-block',
      padding: '4px 12px',
      background: '#225788ff',
      color: 'white',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '500'
    },

    sectionHeader: {
      marginBottom: '30px',
      textAlign: 'center'
    },

    sectionTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#003D5C',
      marginBottom: '10px'
    },

    sectionDescription: {
      color: '#4A5568',
      fontSize: '1.1rem',
      maxWidth: '600px',
      margin: '0 auto'
    },

    trackingList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },

    trackingCard: {
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
    },

    trackingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },

    trackingId: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#003D5C'
    },

    trackingStatus: {
      padding: '6px 12px',
      borderRadius: '20px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: '500'
    },

    trackingContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    trackingDetails: {
      flex: 1
    },

    trackingType: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '5px'
    },

    trackingInfo: {
      color: '#4A5568',
      fontSize: '0.9rem',
      margin: '3px 0'
    },

    progressContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: '150px'
    },

    progressBar: {
      flex: 1,
      height: '8px',
      background: '#E2E8F0',
      borderRadius: '4px',
      overflow: 'hidden'
    },

    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #003D5C, #005580)',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },

    progressText: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#003D5C',
      minWidth: '35px'
    },

    profileGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px'
    },

    profileCard: {
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    },

    profileAvatar: {
      marginBottom: '20px'
    },

    avatarCircle: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #003D5C, #005580)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: '700',
      color: 'white',
      margin: '0 auto 15px'
    },

    changePhotoBtn: {
      padding: '6px 12px',
      border: '1px solid #E2E8F0',
      borderRadius: '20px',
      background: 'white',
      cursor: 'pointer',
      fontSize: '0.8rem',
      color: '#4A5568'
    },

    profileInfo: {
      textAlign: 'center'
    },

    profileName: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '5px'
    },

    profileEmail: {
      color: '#4A5568',
      marginBottom: '5px'
    },

    profileMember: {
      fontSize: '0.8rem',
      color: '#718096'
    },

    profileDetails: {
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
    },

    profileField: {
      marginBottom: '20px'
    },

    fieldLabel: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#2D3748'
    },

    fieldInput: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      fontSize: '1rem',
      background: '#F7FAFC'
    },

    fieldTextarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      fontSize: '1rem',
      background: '#F7FAFC',
      minHeight: '80px',
      resize: 'vertical'
    },

    editButton: {
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #003D5C, #005580)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },

    preferencesCard: {
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
    },

    preferenceItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 0',
      borderBottom: '1px solid #F7FAFC'
    },

    preferenceSelect: {
      padding: '8px 12px',
      border: '1px solid #E2E8F0',
      borderRadius: '6px',
      background: 'white',
      minWidth: '150px'
    },

    rewardsCard: {
      background: 'linear-gradient(135deg, #003D5C, #005580)',
      color: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 61, 92, 0.3)',
      textAlign: 'center'
    },

    rewardBalance: {
      marginBottom: '20px'
    },

    pointsDisplay: {
      fontSize: '3rem',
      fontWeight: '700',
      marginBottom: '5px'
    },

    pointsLabel: {
      fontSize: '1rem',
      opacity: 0.9
    },

    rewardActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center'
    },

    rewardButton: {
      padding: '10px 20px',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },

    logoutButton: {
      position: 'fixed',
      top: '20px',
      right: '30px',
      padding: '10px 20px',
      background: '#E53E3E',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.welcomeText}>Welcome back, {user.name}!</h1>
            {user.userType && (
              <span style={styles.userTypeBadge}>
                {user.userType === 'business' ? 'Business' : 'Home'} User
              </span>
            )}
          </div>
          <div style={styles.headerActions}>
            <div style={styles.timeDisplay}>
              {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
            </div>
            <button style={styles.notificationBell}>
              🔔
              {notifications > 0 && (
                <span style={styles.notificationBadge}>{notifications}</span>
              )}
            </button>
          </div>
        </div>
        <div style={styles.nav}>
          {[
            { key: 'overview', label: 'Dashboard', icon: '🏠' },
            { key: 'pickup', label: 'Request Pickup', icon: '🚛' },
            { key: 'track', label: 'Track Status', icon: '📍' },
            { key: 'complaints', label: 'Complaints', icon: '📝' },
            { key: 'profile', label: 'Profile', icon: '👤' }
          ].map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.navButton,
                ...(activeTab === tab.key ? styles.activeNavButton : {})
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.content}>
        {renderContent()}
      </div>

      <button
        style={styles.logoutButton}
        onClick={() => onNavigate("home")}
        onMouseEnter={(e) => {
          e.target.style.background = '#C53030';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#E53E3E';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default UserDashboard;