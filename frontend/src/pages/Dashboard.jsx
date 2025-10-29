import React from 'react';
import { Home, Briefcase } from 'lucide-react';

const WasteManagementDashboard = ({ onNavigate }) => {
  const handleNavigation = (type) => {
    if (type === 'Home Maintenance') {
      onNavigate('adminDashboard');
    } else if (type === 'Business Maintenance') {
      onNavigate('businessDashboard');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.centerContent}>
        <h1 style={styles.title}>Waste Management System</h1>
        <p style={styles.subtitle}>Choose your service type</p>
        
        <div style={styles.buttonContainer}>
          <button 
            style={styles.button}
            onClick={() => handleNavigation('Home Maintenance')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 61, 92, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 61, 92, 0.3)';
            }}
          >
            <Home size={48} />
            <span style={styles.buttonText}>Home Maintenance</span>
          </button>

          <button 
            style={styles.button}
            onClick={() => handleNavigation('Business Maintenance')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 61, 92, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 61, 92, 0.3)';
            }}
          >
            <Briefcase size={48} />
            <span style={styles.buttonText}>Business Maintenance</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    background: '#003D5C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif",
  },
  centerContent: {
    textAlign: 'center',
    padding: '40px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '60px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '40px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    width: '280px',
    height: '280px',
    background: 'white',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    boxShadow: '0 10px 30px rgba(0, 61, 92, 0.3)',
    transition: 'all 0.3s ease',
    padding: '30px',
  },
  buttonText: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#003D5C',
  },
};

export default WasteManagementDashboard;