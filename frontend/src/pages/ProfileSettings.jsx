import React, { useState, useEffect } from 'react';

function ProfileSettings({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    profilePicture: user.profilePicture || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      profilePicture: user.profilePicture || ''
    });
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      alert('Profile updated successfully!');
      setIsEditing(false);
      // Optionally, you could trigger a refresh of user data here
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      profilePicture: user.profilePicture || ''
    });
    setIsEditing(false);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '30px'
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

    cardTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: '20px',
      borderBottom: '2px solid #E2E8F0',
      paddingBottom: '10px'
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
      background: isEditing ? 'white' : '#F7FAFC',
      outline: isEditing ? '2px solid #003D5C' : 'none'
    },

    fieldTextarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      fontSize: '1rem',
      background: isEditing ? 'white' : '#F7FAFC',
      minHeight: '80px',
      resize: 'vertical',
      outline: isEditing ? '2px solid #003D5C' : 'none'
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

    saveCancelButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end'
    },

    cancelButton: {
      padding: '10px 20px',
      background: '#E2E8F0',
      color: '#4A5568',
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
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Profile Settings</h2>
        <p style={styles.sectionDescription}>
          Manage your account information and preferences
        </p>
      </div>

      <div style={styles.profileGrid}>
        <div style={styles.profileCard}>
          <div style={styles.profileAvatar}>
            <div style={styles.avatarCircle}>
              {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            {isEditing && (
              <button style={styles.changePhotoBtn}>Change Photo</button>
            )}
          </div>
          <div style={styles.profileInfo}>
            <h3 style={styles.profileName}>{formData.name || 'User'}</h3>
            <p style={styles.profileEmail}>{user.email}</p>
            <p style={styles.profileMember}>Member since {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div style={styles.profileDetails}>
          <h3 style={styles.cardTitle}>Personal Information</h3>
          <div style={styles.profileField}>
            <label style={styles.fieldLabel}>Full Name</label>
            <input
              style={styles.fieldInput}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div style={styles.profileField}>
            <label style={styles.fieldLabel}>Email Address</label>
            <input
              style={styles.fieldInput}
              value={user.email}
              disabled
            />
          </div>
          <div style={styles.profileField}>
            <label style={styles.fieldLabel}>Phone Number</label>
            <input
              style={styles.fieldInput}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div style={styles.profileField}>
            <label style={styles.fieldLabel}>Address</label>
            <textarea
              style={styles.fieldTextarea}
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          {isEditing ? (
            <div style={styles.saveCancelButtons}>
              <button style={styles.cancelButton} onClick={handleCancel}>Cancel</button>
              <button style={styles.editButton} onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button style={styles.editButton} onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}
        </div>

        <div style={styles.preferencesCard}>
          <h3 style={styles.cardTitle}>Pickup Preferences</h3>
          <div style={styles.preferenceItem}>
            <span>Preferred Pickup Time</span>
            <select style={styles.preferenceSelect}>
              <option>Morning (8AM - 12PM)</option>
              <option>Afternoon (12PM - 4PM)</option>
              <option>Evening (4PM - 8PM)</option>
            </select>
          </div>
          <div style={styles.preferenceItem}>
            <span>Notification Method</span>
            <select style={styles.preferenceSelect}>
              <option>SMS + Email</option>
              <option>Email Only</option>
              <option>SMS Only</option>
            </select>
          </div>
          <div style={styles.preferenceItem}>
            <span>Weekly Pickup Day</span>
            <select style={styles.preferenceSelect}>
              <option>Monday</option>
              <option>Wednesday</option>
              <option>Friday</option>
            </select>
          </div>
        </div>

        <div style={styles.rewardsCard}>
          <h3 style={styles.cardTitle}>Eco Rewards</h3>
          <div style={styles.rewardBalance}>
            <div style={styles.pointsDisplay}>{user.ecoPoints || 0}</div>
            <div style={styles.pointsLabel}>Points Available</div>
          </div>
          <div style={styles.rewardActions}>
            <button style={styles.rewardButton}>Redeem Points</button>
            <button style={styles.rewardButton}>View History</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
