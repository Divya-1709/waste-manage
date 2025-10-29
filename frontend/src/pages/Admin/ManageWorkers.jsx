import React, { useState, useEffect } from 'react';

function ManageWorkers({ onBack }) {
  const [workers, setWorkers] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    role: 'driver',
    phone: '',
    assignedVehicle: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/workers');
        if (!res.ok) {
          throw new Error('Failed to fetch workers. Are you logged in as admin?');
        }
        const data = await res.json();
        setWorkers(data.map(w => ({ ...w, id: w._id })));
      } catch (error) {
        showNotif(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotif = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAddWorker = async () => {
    if (!formData.name || !formData.phone) {
      showNotif('Please fill all required fields!');
      return;
    }

    try {
      const url = editingId ? `/api/admin/workers/${editingId}` : '/api/admin/workers';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${editingId ? 'update' : 'add'} worker.`);
      }

      if (editingId) {
        // Update existing worker in the list
        setWorkers(workers.map(w => (w.id === editingId ? { ...data, id: data._id } : w)));
        showNotif('Worker updated successfully!');
        setEditingId(null);
      } else {
        // Add new worker to the list
        const newWorker = { ...data, id: data._id };
        setWorkers([...workers, newWorker]);
        showNotif('Worker added successfully!');
      }
    } catch (error) {
      showNotif(error.message);
      return; // Prevent form reset on error
    }

    setFormData({
      name: '',
      role: 'driver',
      phone: '',
      assignedVehicle: ''
    });
  };

  const handleEdit = (worker) => {
    setFormData({
      name: worker.name,
      role: worker.role,
      phone: worker.phone,
      assignedVehicle: worker.assignedVehicle
    });
    setEditingId(worker.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        const res = await fetch(`/api/admin/workers/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete worker.');
        }
        setWorkers(workers.filter(w => w.id !== id));
        showNotif('Worker deleted successfully!');
      } catch (error) {
        showNotif(error.message);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/workers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      const updatedWorker = await res.json();
      setWorkers(workers.map(w => (w.id === id ? { ...updatedWorker, id: updatedWorker._id } : w)));
      showNotif('Worker status updated!');
    } catch (error) {
      showNotif(error.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: 'driver',
      phone: '',
      assignedVehicle: ''
    });
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         worker.phone.includes(searchQuery);
    const matchesFilter = filterRole === 'all' || worker.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const getRoleColor = (role) => {
    const colors = {
      'driver': { bg: '#e0f2fe', color: '#0c4a6e', border: '#38bdf8' },
      'collector': { bg: '#f0e7f5', color: '#581c87', border: '#a855f7' },
      'supervisor': { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' }
    };
    return colors[role] || colors.driver;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': { bg: '#e8f4f8', color: '#005580', border: '#007872' },
      'on-leave': { bg: '#fffbeb', color: '#b45309', border: '#f59e0b' },
      'inactive': { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' }
    };
    return colors[status] || colors.active;
  };

  const styles = {
    container: {
      padding: '0',
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      background: 'transparent'
    },

    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    },

    loadingText: {
      fontSize: '1.5rem',
      color: '#003D5C',
      fontWeight: '600'
    },

    header: {
      background: 'white',
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
      fontWeight: '800',
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
      padding: '14px 18px',
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      cursor: 'pointer',
      background: 'white'
    },

    formSection: {
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },

    formTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#003D5C',
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },

    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#005580',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },

    input: {
      padding: '14px 18px',
      border: '1px solid #cbd5e0',
      borderRadius: '12px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      background: '#f8fafc',
      fontWeight: '500'
    },

    select: {
      padding: '14px 18px',
      border: '1px solid #cbd5e0',
      borderRadius: '12px',
      fontSize: '1rem',
      outline: 'none',
      cursor: 'pointer',
      background: '#f8fafc',
      fontWeight: '500'
    },

    buttonGroup: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },

    addButton: {
      padding: '14px 32px',
      background: 'linear-gradient(135deg, #003D5C, #005580)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 20px rgba(0, 61, 92, 0.3)'
    },

    cancelButton: {
      padding: '14px 32px',
      background: 'transparent',
      color: '#6c757d',
      border: '2px solid #6c757d',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },

    tableSection: {
      background: 'white',
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
      padding: '20px 25px',
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

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '900px'
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
      borderRadius: '20px',
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

    editButton: {
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

    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h2 style={styles.loadingText}>Loading Workers...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.notification}>{notificationMessage}</div>

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
              <span>👷</span> Manage Workers
            </h1>
           
          </div>
         
        </div>

        <div style={styles.filterSection}>
          <input
            type="text"
            placeholder="🔍 Search by worker name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput} // This style is now updated
            onFocus={(e) => e.target.style.borderColor = '#005580'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Roles</option>
            <option value="driver">Driver</option>
            <option value="collector">Collector</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>
      </div>

      <div style={styles.formSection}>
        <h2 style={styles.formTitle}>
          {editingId ? '✏ Edit Worker' : '➕ Add New Worker'}
        </h2>
        
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Worker Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter worker name"
              style={styles.input} // This style is now updated
              onFocus={(e) => e.target.style.borderColor = '#005580'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={styles.select} // This style is now updated
              onFocus={(e) => e.target.style.borderColor = '#005580'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
            >
              <option value="driver">Driver</option>
              <option value="collector">Collector</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+91 XXXXX XXXXX"
              style={styles.input} // This style is now updated
              onFocus={(e) => e.target.style.borderColor = '#005580'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Assigned Vehicle</label>
            <input
              type="text"
              name="assignedVehicle"
              value={formData.assignedVehicle}
              onChange={handleInputChange}
              placeholder="TN-XX-X-XXXX or N/A"
              style={styles.input} // This style is now updated
              onFocus={(e) => e.target.style.borderColor = '#005580'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
            />
          </div>
        </div>

        <div style={styles.buttonGroup}>
          {editingId && (
            <button 
              style={styles.cancelButton}
              onClick={cancelEdit}
              onMouseEnter={(e) => {
                e.target.style.background = '#6c757d';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6c757d';
              }}
            >
              Cancel
            </button>
          )}
          <button 
            style={styles.addButton}
            onClick={handleAddWorker}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 61, 92, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 61, 92, 0.3)';
            }}
          >
            {editingId ? 'Update Worker' : 'Add Worker'}
          </button>
        </div>
      </div>

      <div style={styles.tableSection}>
        <div style={styles.statsBar}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{workers.length}</div>
            <div style={styles.statLabel}>Total Workers</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{workers.filter(w => w.role === 'driver').length}</div>
            <div style={styles.statLabel}>Drivers</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{workers.filter(w => w.role === 'collector').length}</div>
            <div style={styles.statLabel}>Collectors</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{workers.filter(w => w.role === 'supervisor').length}</div>
            <div style={styles.statLabel}>Supervisors</div>
          </div>
        </div>

        <h2 style={styles.formTitle}>📋 Worker List</h2>
        
        {filteredWorkers.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '3rem', marginBottom: '20px' }}>👷</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {searchQuery || filterRole !== 'all' ? 'No workers match your search' : 'No workers added yet'}
            </p>
            <p>
              {searchQuery || filterRole !== 'all' ? 'Try a different search term' : 'Add your first worker using the form above'}
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Assigned Vehicle</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Total Trips</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => {
                const roleStyle = getRoleColor(worker.role);
                const statusStyle = getStatusColor(worker.status);
                return (
                  <tr 
                    key={worker.id} 
                    style={styles.tr}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={styles.td}><strong>{worker.name}</strong></td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: roleStyle.bg,
                        color: roleStyle.color,
                        border: `2px solid ${roleStyle.border}`
                      }}>
                        {worker.role}
                      </span>
                    </td>
                    <td style={styles.td}>{worker.phone}</td>
                    <td style={styles.td}>{worker.assignedVehicle}</td>
                    <td style={styles.td}>
                      <select
                        value={worker.status}
                        onChange={(e) => handleStatusChange(worker.id, e.target.value)}
                        style={{
                          ...styles.statusSelect,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderColor: statusStyle.border
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="on-leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td style={styles.td}><strong>{worker.totalTrips}</strong></td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.editButton}
                          onClick={() => handleEdit(worker)}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          Edit
                        </button>
                        <button 
                          style={styles.deleteButton}
                          onClick={() => handleDelete(worker.id)}
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

export default ManageWorkers;
