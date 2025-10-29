import React from 'react';

const AdminAssignment = ({ onNavigate }) => {
  return (
    <div style={styles.container}>
      <h1>Admin Assignment</h1>
      <p>Manage waste collection assignments here.</p>
      <button onClick={() => onNavigate('adminDashboard')} style={styles.button}>Back to Dashboard</button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
  },
  button: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #2E7D32, #388E3C)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default AdminAssignment;
