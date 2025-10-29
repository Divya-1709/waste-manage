import React, { useState, useEffect } from 'react';

function ComplaintManagement({ onBack }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/admin/complaints');
      if (!res.ok) throw new Error('Failed to fetch complaints');
      const data = await res.json();
      setComplaints(data.map(c => ({ ...c, id: c._id })));
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (id, status, adminResponse = '') => {
    try {
      const res = await fetch(`/api/admin/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse }),
      });
      if (!res.ok) throw new Error('Failed to update complaint status');
      const updatedComplaint = await res.json();
      setComplaints(complaints.map(c => (c.id === id ? { ...updatedComplaint, id: updatedComplaint._id } : c)));
      setShowResponseModal(false);
      setSelectedComplaint(null);
      setResponseText('');
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  const openResponseModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.adminResponse || '');
    setShowResponseModal(true);
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filterStatus === 'all') return true;
    return complaint.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'closed': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading complaints...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Complaint Management</h2>
        <button style={styles.backButton} onClick={onBack}>← Back to Dashboard</button>
      </div>

      <div style={styles.filterContainer}>
        <label style={styles.filterLabel}>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Complaints</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div style={styles.complaintsList}>
        {filteredComplaints.length === 0 ? (
          <div style={styles.noComplaints}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📝</div>
            <h3>No complaints found</h3>
            <p>All complaints are resolved or there are no complaints yet.</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div key={complaint.id} style={styles.complaintCard}>
              <div style={styles.complaintHeader}>
                <div style={styles.complaintId}>#{complaint.id.slice(-6).toUpperCase()}</div>
                <div style={{...styles.statusBadge, backgroundColor: getStatusColor(complaint.status)}}>
                  {complaint.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div style={styles.complaintContent}>
                <div style={styles.complaintDetails}>
                  <h4 style={styles.complaintType}>
                    {complaint.type.replace('_', ' ').toUpperCase()}
                  </h4>
                  <p style={styles.complaintDescription}>{complaint.description}</p>
                  <div style={styles.userInfo}>
                    <span style={styles.userLabel}>User:</span> {complaint.userId?.name || 'Unknown'} ({complaint.userId?.email || 'N/A'})
                  </div>
                  <div style={styles.dateInfo}>
                    Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                  {complaint.adminResponse && (
                    <div style={styles.adminResponse}>
                      <strong>Admin Response:</strong> {complaint.adminResponse}
                    </div>
                  )}
                </div>

                <div style={styles.complaintActions}>
                  {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                    <>
                      <button
                        style={styles.actionButton}
                        onClick={() => updateComplaintStatus(complaint.id, 'in_progress')}
                      >
                        Mark In Progress
                      </button>
                      <button
                        style={{...styles.actionButton, backgroundColor: '#4CAF50'}}
                        onClick={() => openResponseModal(complaint)}
                      >
                        Resolve
                      </button>
                    </>
                  )}
                  {complaint.status === 'resolved' && (
                    <button
                      style={{...styles.actionButton, backgroundColor: '#9E9E9E'}}
                      onClick={() => updateComplaintStatus(complaint.id, 'closed')}
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showResponseModal && selectedComplaint && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Resolve Complaint</h3>
            <div style={styles.modalContent}>
              <p><strong>Type:</strong> {selectedComplaint.type.replace('_', ' ')}</p>
              <p><strong>Description:</strong> {selectedComplaint.description}</p>
              <textarea
                style={styles.responseTextarea}
                placeholder="Enter your response to the user..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
              />
            </div>
            <div style={styles.modalActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowResponseModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.resolveButton}
                onClick={() => updateComplaintStatus(selectedComplaint.id, 'resolved', responseText)}
              >
                Resolve Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0,
  },
  backButton: {
    padding: '10px 20px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  filterContainer: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  filterLabel: {
    fontWeight: '600',
    color: '#4a5568',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '1rem',
  },
  complaintsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  noComplaints: {
    textAlign: 'center',
    padding: '50px',
    color: '#4a5568',
  },
  complaintCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  complaintHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  complaintId: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  complaintContent: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },
  complaintDetails: {
    flex: 1,
  },
  complaintType: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
  },
  complaintDescription: {
    color: '#4a5568',
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  userInfo: {
    fontSize: '0.9rem',
    color: '#718096',
    marginBottom: '5px',
  },
  dateInfo: {
    fontSize: '0.9rem',
    color: '#718096',
    marginBottom: '10px',
  },
  adminResponse: {
    background: '#f7fafc',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    color: '#2d3748',
    borderLeft: '4px solid #4CAF50',
  },
  complaintActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: '150px',
  },
  actionButton: {
    padding: '8px 16px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '20px',
  },
  modalContent: {
    marginBottom: '20px',
  },
  responseTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '1rem',
    marginTop: '10px',
    resize: 'vertical',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  resolveButton: {
    padding: '10px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default ComplaintManagement;
