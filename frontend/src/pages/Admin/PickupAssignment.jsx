import React, { useState, useEffect } from 'react';

function PickupAssignment({ onBack, pickups, setPickups }) {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch drivers (workers with the 'driver' role)
        const driversRes = await fetch('/api/admin/workers');
        if (!driversRes.ok) {
          throw new Error('Failed to fetch drivers.');
        }
        const allWorkers = await driversRes.json();
        setDrivers(allWorkers.filter(w => w.role === 'driver').map(d => ({ ...d, id: d._id })));

        // Fetch all vehicles to find vehicle ID from license plate
        const vehiclesRes = await fetch('/api/admin/vehicles');
        if (!vehiclesRes.ok) {
          throw new Error('Failed to fetch vehicles.');
        }
        setVehicles((await vehiclesRes.json()).map(v => ({ ...v, id: v._id })));

      } catch (error) {
        showNotif(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Runs once on component mount

  const showNotif = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pickup request?')) {
      try {
        const res = await fetch(`/api/admin/pickups/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete pickup.');
        }
        setPickups(pickups.filter(p => p.id !== id));
        showNotif('Pickup request deleted successfully!');
      } catch (error) {
        showNotif(error.message);
      }
    }
  };

  const openAssignModal = (pickup) => {
    setSelectedPickup(pickup);
    setShowAssignModal(true);
  };

  const handleAssignDriver = async (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    // Find the vehicle object based on the license plate stored in the driver's profile
    const vehicle = vehicles.find(v => v.licensePlate === driver.assignedVehicle);
    const vehicleId = vehicle ? vehicle.id : null; // Send vehicle's _id, or null if not found

    try {
      const res = await fetch(`/api/admin/pickups/${selectedPickup.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'assigned', driverId: driver.id, vehicleId: vehicleId }),
      });
      if (!res.ok) throw new Error('Failed to assign driver.');

      const updatedPickup = await res.json();
      setPickups(pickups.map(p => (p.id === selectedPickup.id ? { ...updatedPickup, id: updatedPickup._id } : p)));
      showNotif(`Driver ${driver.name} assigned to pickup #${selectedPickup.id}`);
      setShowAssignModal(false);
      setSelectedPickup(null);
    } catch (error) {
      showNotif(error.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/pickups/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status.');
      const updatedPickup = await res.json();
      setPickups(pickups.map(p => (p.id === id ? { ...updatedPickup, id: updatedPickup._id } : p)));
      showNotif('Pickup status updated!');
    } catch (error) {
      showNotif(error.message);
    }
  };

  const filteredPickups = pickups.filter(pickup => {
    const matchesSearch = pickup.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pickup.id.toString().includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || pickup.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': { bg: '#fff3e0', color: '#e65100', border: '#ff9800' },
      'assigned': { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' },
      'in-progress': { bg: '#f3e5f5', color: '#7b1fa2', border: '#9c27b0' },
      'completed': { bg: '#e8f5e9', color: '#2e7d32', border: '#4caf50' },
      'cancelled': { bg: '#ffebee', color: '#c62828', border: '#ef5350' }
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': { bg: '#ffebee', color: '#c62828' },
      'medium': { bg: '#fff3e0', color: '#e65100' },
      'low': { bg: '#e8f5e9', color: '#2e7d32' }
    };
    return colors[priority] || colors.medium;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
      padding: '20px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    },

    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    },

    loadingText: {
      fontSize: '1.5rem',
      color: '#2e7d32',
      fontWeight: '600'
    },

    header: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(46, 125, 50, 0.1)'
    },

    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '15px'
    },

    backButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #6c757d, #adb5bd)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
    },

    title: {
      fontSize: '2rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #1B5E20, #2E7D32, #388E3C)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },

    welcomeText: {
      fontSize: '1.1rem',
      color: '#4a5568',
      fontWeight: '500',
      marginTop: '10px'
    },

    logoutButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #c62828, #ef5350)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(198, 40, 40, 0.3)'
    },

    filterSection: {
      display: 'flex',
      gap: '15px',
      marginTop: '20px',
      flexWrap: 'wrap'
    },

    searchInput: {
      flex: 1,
      minWidth: '250px',
      padding: '12px 18px',
      border: '2px solid rgba(46, 125, 50, 0.2)',
      borderRadius: '12px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease'
    },

    filterSelect: {
      padding: '12px 18px',
      border: '2px solid rgba(46, 125, 50, 0.2)',
      borderRadius: '12px',
      fontSize: '1rem',
      outline: 'none',
      cursor: 'pointer',
      background: 'white'
    },

    tableSection: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(46, 125, 50, 0.1)',
      overflowX: 'auto'
    },

    statsBar: {
      display: 'flex',
      gap: '20px', // Reduced gap for a tighter look
      marginBottom: '30px', // Increased margin bottom
      flexWrap: 'wrap'
    },

    statCard: {
      flex: 1,
      minWidth: '180px', // Increased min-width
      padding: '15px 20px',
      background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
      borderRadius: '12px',
      textAlign: 'center',
      border: '1px solid rgba(46, 125, 50, 0.2)'
    },

    statValue: {
      fontSize: '2rem',
      fontWeight: '800', // Bolder font weight
      color: '#1B5E20', // Dark green color
      marginBottom: '5px'
    },

    statLabel: {
      fontSize: '0.85rem',
      color: '#2e7d32', // Medium green color
      fontWeight: '600',
      marginTop: '5px'
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1000px' // Adjusted min-width
    },

    th: {
      padding: '16px',
      textAlign: 'left',
      borderBottom: '2px solid rgba(46, 125, 50, 0.2)',
      fontWeight: '700',
      color: '#1B5E20',
      fontSize: '0.95rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },

    td: {
      padding: '16px',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      fontSize: '0.95rem',
      color: '#4a5568'
    },

    tr: {
      transition: 'all 0.3s ease'
    },

    badge: {
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block'
    },

    statusSelect: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: '2px solid rgba(46, 125, 50, 0.2)',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      outline: 'none'
    },

    actionButtons: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    },

    assignButton: {
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },

    deleteButton: {
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #c62828, #ef5350)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },

    notification: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
      color: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(46, 125, 50, 0.4)',
      zIndex: 1000,
      fontWeight: '600',
      animation: 'slideIn 0.3s ease-out',
      display: showNotification ? 'block' : 'none'
    },

    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: showAssignModal ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(5px)'
    },

    modalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },

    modalHeader: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1B5E20',
      marginBottom: '20px'
    },

    driverList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },

    driverCard: {
      padding: '15px',
      border: '2px solid rgba(46, 125, 50, 0.2)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    driverInfo: {
      flex: 1
    },

    driverName: {
      fontWeight: '600',
      color: '#1B5E20',
      marginBottom: '5px'
    },

    driverVehicle: {
      fontSize: '0.9rem',
      color: '#6c757d'
    },

    driverStatus: {
      padding: '4px 10px',
      borderRadius: '15px',
      fontSize: '0.8rem',
      fontWeight: '600'
    },

    closeButton: {
      marginTop: '20px',
      width: '100%',
      padding: '12px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer'
    },

    selectDriverButton: {
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },

    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h2 style={styles.loadingText}>Loading Pickup Assignments...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.notification}>{notificationMessage}</div>

      {/* Assign Driver Modal */}
      <div style={styles.modal} onClick={() => setShowAssignModal(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h3 style={styles.modalHeader}>🚚 Assign Driver</h3>
          <p style={{ marginBottom: '20px', color: '#4a5568' }}>
            Select a driver for Pickup #{selectedPickup?.id}
          </p>
          <div style={styles.driverList}>
            {drivers.map(driver => (
              <div 
                key={driver.id}
                style={styles.driverCard}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(46, 125, 50, 0.2)';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={styles.driverInfo}>
                  <div style={styles.driverName}>{driver.name}</div>
                  <div style={styles.driverVehicle}>🚛 {driver.assignedVehicle || 'No Vehicle'}</div>
                </div>
                <span style={{
                  ...styles.driverStatus,
                  background: driver.status === 'available' ? '#e8f5e9' : '#ffebee',
                  color: driver.status === 'available' ? '#2e7d32' : '#c62828'
                }}>
                  {driver.status}
                </span>
                {driver.status === 'available' && (
                  <button 
                    style={styles.selectDriverButton}
                    onClick={() => handleAssignDriver(driver.id)}
                  >
                    Select
                  </button>
                )}
              </div>
            ))}
          </div>
          <button 
            style={styles.closeButton}
            onClick={() => setShowAssignModal(false)}
          >
            Close
          </button>
        </div>
      </div>

      <div style={styles.header}>
        <div style={styles.headerTop}>
          <button 
            style={styles.backButton}
            onClick={onBack}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
            }}
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 style={styles.title}>
              <span>🚚</span> Assign Pickups
            </h1>
           
          </div>
          
        </div>

        <div style={styles.filterSection}>
          <input
            type="text"
            placeholder="🔍 Search by user name or pickup ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => e.target.style.borderColor = '#2E7D32'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(46, 125, 50, 0.2)'}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={styles.tableSection}>
        <div style={styles.statsBar}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{pickups.length}</div>
            <div style={styles.statLabel}>Total Pickups</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{pickups.filter(p => p.status === 'pending').length}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{pickups.filter(p => p.status === 'assigned').length}</div>
            <div style={styles.statLabel}>Assigned</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{pickups.filter(p => p.status === 'completed').length}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
        </div>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1B5E20',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'}}>📋 Pickup Requests</h2>
        
        {filteredPickups.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '3rem', marginBottom: '20px' }}>🚚</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {searchQuery || filterStatus !== 'all' ? 'No pickups match your search' : 'No pickup requests yet'}
            </p>
            <p>
              {searchQuery || filterStatus !== 'all' ? 'Try a different search term or filter' : 'New pickup requests from users will appear here.'}
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Waste Type</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Driver</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPickups.map((pickup) => {
                const statusStyle = getStatusColor(pickup.status);
                const priorityStyle = getPriorityColor(pickup.priority);
                return (
                  <tr 
                    key={pickup.id} 
                    style={styles.tr}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={styles.td}><strong>#{pickup.id}</strong></td>
                    <td style={styles.td}>
                      <div><strong>{pickup.userName}</strong></div>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{pickup.userPhone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ textTransform: 'capitalize' }}>{pickup.wasteType}</span>
                    </td>
                    <td style={styles.td}>{pickup.location}</td>
                    <td style={styles.td}>
                      <div>{pickup.date}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{pickup.time}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: priorityStyle.bg,
                        color: priorityStyle.color
                      }}>
                        {pickup.priority}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select
                        value={pickup.status}
                        onChange={(e) => handleStatusChange(pickup.id, e.target.value)}
                        style={{
                          ...styles.statusSelect,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderColor: statusStyle.border
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      {pickup.driverId ? (
                        <div>
                          <div style={{ fontWeight: '600', color: '#2e7d32' }}>{pickup.driverId.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{pickup.assignedVehicle ? pickup.assignedVehicle.licensePlate : ''}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#6c757d', fontStyle: 'italic' }}>Not Assigned</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        {pickup.status === 'pending' && (
                          <button 
                            style={styles.assignButton}
                            onClick={() => openAssignModal(pickup)}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            Assign Driver
                          </button>
                        )}
                        <button 
                          style={styles.deleteButton}
                          onClick={() => handleDelete(pickup.id)}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PickupAssignment;