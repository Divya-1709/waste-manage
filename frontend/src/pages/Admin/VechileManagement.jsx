import React, { useState, useEffect } from 'react';

function VehicleManagement({ onBack, vehicles, setVehicles }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'truck',
    licensePlate: '',
    capacity: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the vehicles list is empty, fetch it from the server.
    if (vehicles.length === 0) {
      const fetchVehicles = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/admin/vehicles');
          if (!res.ok) throw new Error('Failed to fetch vehicles');
          const data = await res.json();
          setVehicles(data.map(v => ({ ...v, id: v._id })));
        } catch (error) {
          showNotif(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchVehicles();
    }
  }, []); // Empty dependency array means this runs once on mount

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

  const handleAddVehicle = async () => {
    if (!formData.name || !formData.licensePlate || !formData.capacity) {
      showNotif('Please fill all fields!');
      return;
    }

    try {
      const url = editingId ? `/api/admin/vehicles/${editingId}` : '/api/admin/vehicles';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${editingId ? 'update' : 'add'} vehicle.`);
      }

      if (editingId) {
        // Update existing vehicle in the list
        setVehicles(vehicles.map(v => (v.id === editingId ? { ...data, id: data._id } : v)));
        showNotif('Vehicle updated successfully!');
        setEditingId(null);
      } else {
        // Add new vehicle to the list
        const newVehicle = { ...data, id: data._id };
        setVehicles([...vehicles, newVehicle]);
        showNotif('Vehicle added successfully!');
      }
    } catch (error) {
      showNotif(error.message);
      return; // Prevent form reset on error
    }

    // Reset form
    setFormData({
      name: '',
      type: 'truck',
      licensePlate: '',
      capacity: ''
    });
  };

  const handleEdit = (vehicle) => {
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      licensePlate: vehicle.licensePlate,
      capacity: vehicle.capacity
    });
    setEditingId(vehicle.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const res = await fetch(`/api/admin/vehicles/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete vehicle.');
        }
        setVehicles(vehicles.filter(v => v.id !== id));
        showNotif('Vehicle deleted successfully!');
      } catch (error) {
        showNotif(error.message);
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setVehicles(vehicles.map(v => 
      v.id === id ? { ...v, status: newStatus } : v
    ));
    showNotif('Vehicle status updated!');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'truck',
      licensePlate: '',
      capacity: ''
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return { bg: '#e8f5e9', color: '#2e7d32', border: '#4caf50' };
      case 'in-use': return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' };
      case 'maintenance': return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' };
      default: return { bg: '#f5f5f5', color: '#666', border: '#999' };
    }
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <h2>Loading Vehicles...</h2>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
      padding: '20px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
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
      boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
      marginBottom: '20px'
    },

    formSection: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(46, 125, 50, 0.1)'
    },

    formTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1B5E20',
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
      color: '#2e7d32',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },

    input: {
      padding: '14px 18px',
      border: '2px solid rgba(46, 125, 50, 0.2)',
      borderRadius: '12px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      background: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '500'
    },

    select: {
      padding: '14px 18px',
      border: '2px solid rgba(46, 125, 50, 0.2)',
      borderRadius: '12px',
      fontSize: '1rem',
      outline: 'none',
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.9)',
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
      background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 20px rgba(27, 94, 32, 0.3)'
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
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(46, 125, 50, 0.1)',
      overflowX: 'auto'
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '800px'
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

    statusBadge: {
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

    editButton: {
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #1565c0, #2196f3)',
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

    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    }
  };

  return (
    <div style={styles.container}>
      {/* Notification */}
      <div style={styles.notification}>
        {notificationMessage}
      </div>

      {/* Back Button */}
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

      {/* Add/Edit Vehicle Form */}
      <div style={styles.formSection}>
        <h2 style={styles.formTitle}>
          {editingId ? '✏ Edit Vehicle' : '➕ Add New Vehicle'}
        </h2>
        
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Vehicle Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter vehicle name"
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#2E7D32'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(46, 125, 50, 0.2)'}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Vehicle Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#2E7D32'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(46, 125, 50, 0.2)'}
            >
              <option value="truck">Truck</option>
              <option value="compactor">Compactor</option>
              <option value="mini-truck">Mini Truck</option>
              <option value="collection-vehicle">Collection Vehicle</option>
              <option value="recycling-truck">Recycling Truck</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>License Plate</label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleInputChange}
              placeholder="Enter license plate"
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#2E7D32'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(46, 125, 50, 0.2)'}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Capacity (tons)</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="Enter capacity"
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#2E7D32'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(46, 125, 50, 0.2)'}
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
            onClick={handleAddVehicle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 30px rgba(27, 94, 32, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 20px rgba(27, 94, 32, 0.3)';
            }}
          >
            {editingId ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      <div style={styles.tableSection}>
        <h2 style={styles.formTitle}>📋 Vehicle List</h2>
        
        {vehicles.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '3rem', marginBottom: '20px' }}>🚛</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No vehicles added yet</p>
            <p>Add your first vehicle using the form above</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>License Plate</th>
                <th style={styles.th}>Capacity</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => {
                const statusStyle = getStatusColor(vehicle.status);
                return (
                  <tr 
                    key={vehicle.id} 
                    style={styles.tr}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={styles.td}>{vehicle.name}</td>
                    <td style={styles.td}>{vehicle.type}</td>
                    <td style={styles.td}>{vehicle.licensePlate}</td>
                    <td style={styles.td}>{vehicle.capacity}</td>
                    <td style={styles.td}>
                      <select
                        value={vehicle.status}
                        onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                        style={{
                          ...styles.statusSelect,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderColor: statusStyle.border
                        }}
                      >
                        <option value="available">Available</option>
                        <option value="in-use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.editButton}
                          onClick={() => handleEdit(vehicle)}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          Edit
                        </button>
                        <button 
                          style={styles.deleteButton}
                          onClick={() => handleDelete(vehicle.id)}
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

export default VehicleManagement;