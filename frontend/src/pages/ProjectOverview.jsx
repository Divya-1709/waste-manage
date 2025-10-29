import React from 'react';

const ProjectOverview = ({ onNavigate }) => {
  return (
    <div style={styles.container}>
      <h1>Project Overview</h1>
      <p>Learn more about the SmartWaste project.</p>
      <button onClick={() => onNavigate('home')} style={styles.button}>Back to Home</button>
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

export default ProjectOverview;
