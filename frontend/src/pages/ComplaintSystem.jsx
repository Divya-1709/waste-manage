import React, { useState } from 'react';

function ComplaintSystem({ onBack, user }) {
  const [complaintForm, setComplaintForm] = useState({
    type: 'other',
    description: '',
    priority: 'medium'
  });

  const handleFormChange = (field, value) => {
    setComplaintForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...complaintForm
        }),
      });
      if (!response.ok) throw new Error('Failed to submit complaint.');
      alert('Complaint submitted successfully! We will review it shortly.');
      setComplaintForm({
        type: 'other',
        description: '',
        priority: 'medium'
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#003D5C',
      marginBottom: '10px'
    },
    subtitle: {
      color: '#4A5568',
      fontSize: '1.1rem'
    },
    formCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
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
    formInput: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    formTextarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '1rem',
      minHeight: '120px',
      resize: 'vertical',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    formSelect: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '1rem',
      background: 'white',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
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
    backButton: {
      padding: '10px 20px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Submit a Complaint</h2>
        <p style={styles.subtitle}>Let us know about any issues or concerns you have</p>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmitComplaint} style={styles.form}>


          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Description</label>
            <textarea
              style={styles.formTextarea}
              placeholder="Please provide detailed information about your complaint..."
              value={complaintForm.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Type</label>
              <select
                style={styles.formSelect}
                value={complaintForm.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
              >
                <option value="missed_pickup">Missed Pickup</option>
                <option value="late_pickup">Late Pickup</option>
                <option value="incomplete_collection">Incomplete Collection</option>
                <option value="driver_behavior">Driver Behavior</option>
                <option value="billing_issue">Billing Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Priority</label>
              <select
                style={styles.formSelect}
                value={complaintForm.priority}
                onChange={(e) => handleFormChange('priority', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <button type="submit" style={styles.submitButton}>
            Submit Complaint
          </button>
        </form>

        <button onClick={onBack} style={styles.backButton}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ComplaintSystem;
