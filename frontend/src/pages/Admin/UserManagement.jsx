import React, { useState, useEffect } from 'react';

function UserManagement({ onBack, users, setUsers }) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch users when the component mounts if the initial list is empty
  useEffect(() => {
    const fetchUsers = async () => {
      if (users.length === 0) {
        setLoading(true);
        try {
          const res = await fetch('/api/admin/users');
          if (!res.ok) throw new Error('Failed to fetch users');
          const data = await res.json();
          setUsers(data.map(u => ({ ...u, id: u._id })));
        } catch (error) {
          showNotif(error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUsers();
  }, []); // The dependency array is empty, so it runs once on mount

  const showNotif = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete user.');
        }
        setUsers(users.filter(u => u.id !== id));
        showNotif('User deleted successfully!');
      } catch (error) {
        showNotif(error.message);
      }
    }
  };

  const handleStatusToggle = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updatedUser = await res.json();
      setUsers(users.map(u => (u.id === id ? { ...u, ...updatedUser, id: updatedUser._id } : u)));
      showNotif('User status updated!');
    } catch (error) {
      showNotif(error.message);
    }
  };

  const handleSendNotification = (user) => {
    showNotif(`Notification sent to ${user.name}!`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    return status === 'active' 
      ? { bg: '#e8f4f8', color: '#005580', border: '#007872' }
      : { bg: '#ffebee', color: '#c62828', border: '#ef5350' };
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <h2>Loading Users...</h2>
      </div>
    );
  }

  const styles = {
    container: {
      padding: '0', // The parent container in AdminDashboard provides padding
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      background: 'transparent'
    },

    header: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
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
      fontWeight: '700',
      background: 'linear-gradient(135deg, #003D5C, #005580)',
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
      padding: '14px 18px',
      border: '1px solid #cbd5e0',
      borderRadius: '12px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease'
    },

    filterSelect: {
      padding: '12px 18px',
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
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
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflowX: 'auto'
    },

    statsBar: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },

    statCard: {
      flex: 1,
      minWidth: '180px',
      padding: '25px',
      background: 'white',
      borderRadius: '15px',
      textAlign: 'center',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    },

    statValue: {
      fontSize: '2.2rem',
      fontWeight: '800',
      color: '#003D5C',
      marginBottom: '5px'
    },

    statLabel: {
      fontSize: '0.9rem',
      color: '#4a5568',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },

    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#003D5C',
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1000px'
    },

    th: {
      padding: '16px',
      textAlign: 'left',
      borderBottom: '2px solid #e2e8f0',
      fontWeight: '700',
      color: '#4a5568',
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

    statusBadge: {
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block'
    },

    actionButtons: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    },

    viewButton: {
      padding: '8px 16px',
      background: '#005580',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },

    notifyButton: {
      padding: '8px 16px',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },

    toggleButton: {
      padding: '8px 16px',
      background: '#f59e0b',
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
      background: '#dc2626',
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
      padding: '14px 22px',
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
      display: showDetailsModal ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(5px)'
    },

    modalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: '35px',
      maxWidth: '600px',
      width: '90%',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      maxHeight: '80vh',
      overflowY: 'auto'
    },

    modalHeader: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#003D5C',
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },

    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
      marginBottom: '25px'
    },

    detailItem: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },

    detailLabel: {
      fontSize: '0.8rem',
      color: '#2e7d32',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '5px'
    },

    detailValue: {
      fontSize: '1rem',
      color: '#1a202c',
      fontWeight: '600'
    },

    closeButton: {
      marginTop: '20px',
      width: '100%',
      padding: '14px',
      background: '#003D5C',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
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

  return (
    <div style={styles.container}>
      <div style={styles.notification}>{notificationMessage}</div>

      {/* User Details Modal */}
      <div style={styles.modal} onClick={() => setShowDetailsModal(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          {selectedUser && (
            <>
              <h3 style={styles.modalHeader}>
                <span>👤</span> User Details
              </h3>
              
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Full Name</div>
                  <div style={styles.detailValue}>{selectedUser.name}</div>
                </div>
                
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Email</div>
                  <div style={styles.detailValue}>{selectedUser.email}</div>
                </div>
                
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Phone</div>
                  <div style={styles.detailValue}>{selectedUser.phone}</div>
                </div>
                
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Status</div>
                  <div style={styles.detailValue}>
                    <span style={{
                      ...styles.statusBadge,
                      ...getStatusColor(selectedUser.status)
                    }}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
                
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Location</div>
                  <div style={styles.detailValue}>{selectedUser.location}</div>
                </div>
                
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Join Date</div>
                  <div style={styles.detailValue}>{selectedUser.joinDate}</div>
                </div>
                
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Total Pickups</div>
                  <div style={styles.detailValue}>{selectedUser.totalPickups}</div>
                </div>
                
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Eco Points</div>
                  <div style={styles.detailValue}>{selectedUser.ecoPoints}</div>
                </div>
                
                <div style={{...styles.detailItem, gridColumn: '1 / -1'}}>
                  <div style={styles.detailLabel}>Address</div>
                  <div style={styles.detailValue}>{selectedUser.address}</div>
                </div>
                
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Last Active</div>
                  <div style={styles.detailValue}>{selectedUser.lastActive}</div>
                </div>
              </div>
              
              <button 
                style={styles.closeButton}
                onClick={() => setShowDetailsModal(false)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(27, 94, 32, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Close
              </button>
            </>
          )}
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
              <span>👥</span> Registered Users
            </h1>
            
          </div>
        </div>

        <div style={styles.filterSection}>
          <input
            type="text"
            placeholder="🔍 Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput} // This style is now updated
            onFocus={(e) => e.target.style.borderColor = '#2E7D32'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(46, 125, 50, 0.2)'}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
          </select>
        </div>
      </div>

      <div style={styles.tableSection}>
        <div style={styles.statsBar}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{users.length}</div>
            <div style={styles.statLabel}>Total Registered</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{users.filter(u => u.status === 'active').length}</div>
            <div style={styles.statLabel}>Active Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{users.filter(u => u.status === 'inactive').length}</div>
            <div style={styles.statLabel}>Inactive Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{users.reduce((sum, u) => sum + u.totalPickups, 0)}</div>
            <div style={styles.statLabel}>Total Pickups</div>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>📋 User List</h2>
        
        {filteredUsers.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '3rem', marginBottom: '20px' }}>👥</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {searchQuery || filterStatus !== 'all' ? 'No users match your search' : 'No registered users yet'}
            </p>
            <p>
              {searchQuery || filterStatus !== 'all' ? 'Try a different search term or filter' : 'Users will appear here when they register through the User Dashboard'}
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User Info</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Pickups</th>
                <th style={styles.th}>Eco Points</th>
                <th style={styles.th}>Last Active</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const statusStyle = getStatusColor(user.status);
                return (
                  <tr 
                    key={user.id} 
                    style={styles.tr}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={styles.td}>
                      <div><strong>{user.name}</strong></div>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>ID: {user.id}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ marginBottom: '4px' }}>{user.email}</div>
                      <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{user.phone}</div>
                    </td>
                    <td style={styles.td}>{user.location}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `2px solid ${statusStyle.border}`
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={styles.td}><strong>{user.totalPickups}</strong></td>
                    <td style={styles.td}>
                      <span style={{ 
                        fontWeight: '700', 
                        color: '#2e7d32',
                        fontSize: '1.05rem'
                      }}>
                        {user.ecoPoints}
                      </span>
                    </td>
                    <td style={styles.td}>{user.lastActive}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.viewButton}
                          onClick={() => handleViewDetails(user)}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                          title="View full details"
                        >
                          View
                        </button>
                        <button 
                          style={styles.notifyButton}
                          onClick={() => handleSendNotification(user)}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                          title="Send notification"
                        >
                          Notify
                        </button>
                        <button 
                          style={styles.toggleButton}
                          onClick={() => handleStatusToggle(user.id)}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                          title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          style={styles.deleteButton}
                          onClick={() => handleDelete(user.id)}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                          title="Delete user"
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
          .stats-bar {
            grid-template-columns: 1fr !important;
          }
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default UserManagement;