import React from 'react';
import { useTranslation } from 'react-i18next';

function Contact({ onNavigate }) {
  const { t } = useTranslation();

  const styles = {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#333',
      lineHeight: 1.6,
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#003d5c',
      marginBottom: '20px'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#666',
      maxWidth: '800px',
      margin: '0 auto'
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginBottom: '40px'
    },
    contactCard: {
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    contactIcon: {
      fontSize: '3rem',
      marginBottom: '20px'
    },
    contactTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#003d5c',
      marginBottom: '15px'
    },
    contactInfo: {
      fontSize: '1rem',
      color: '#555',
      lineHeight: 1.6
    },
    backButton: {
      padding: '12px 30px',
      background: '#2285beff',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      marginTop: '30px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>
          Get in touch with our team for any questions or to schedule services
        </p>
      </div>

      <div style={styles.contactGrid}>
        <div style={styles.contactCard}>
          <div style={styles.contactIcon}>📞</div>
          <h3 style={styles.contactTitle}>Phone</h3>
          <p style={styles.contactInfo}>
            Call us for immediate assistance<br/>
            <strong>+91 98765 43210</strong><br/>
            Monday - Saturday: 8:00 AM - 8:00 PM<br/>
            Sunday: 9:00 AM - 5:00 PM
          </p>
        </div>

        <div style={styles.contactCard}>
          <div style={styles.contactIcon}>📧</div>
          <h3 style={styles.contactTitle}>Email</h3>
          <p style={styles.contactInfo}>
            Send us an email for inquiries<br/>
            <strong>support@smartwaste.com</strong><br/>
            <strong>sales@smartwaste.com</strong><br/>
            We respond within 24 hours
          </p>
        </div>

        <div style={styles.contactCard}>
          <div style={styles.contactIcon}>📍</div>
          <h3 style={styles.contactTitle}>Office Location</h3>
          <p style={styles.contactInfo}>
            Visit our headquarters<br/>
            <strong>Chennai, Tamil Nadu</strong><br/>
            123 Green Street<br/>
            Eco District, Chennai - 600001
          </p>
        </div>

        <div style={styles.contactCard}>
          <div style={styles.contactIcon}>🕒</div>
          <h3 style={styles.contactTitle}>Service Areas</h3>
          <p style={styles.contactInfo}>
            We serve the entire Chennai metropolitan area<br/>
            Including suburbs and nearby districts<br/>
            Contact us to check service availability
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.5rem', color: '#003d5c', marginBottom: '20px' }}>
          Emergency Services
        </h3>
        <p style={{ fontSize: '1rem', color: '#555', marginBottom: '20px' }}>
          For urgent waste collection needs or service emergencies, call our 24/7 hotline:
        </p>
        <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#003d5c' }}>
          +91 98765 43211
        </p>
      </div>

      <button style={styles.backButton} onClick={() => onNavigate('home')}>
        Back to Home
      </button>
    </div>
  );
}

export default Contact;
