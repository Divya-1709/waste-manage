import React from 'react';
import { useTranslation } from 'react-i18next';

function About({ onNavigate }) {
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
    section: {
      marginBottom: '40px'
    },
    sectionTitle: {
      fontSize: '1.8rem',
      fontWeight: '600',
      color: '#003d5c',
      marginBottom: '20px'
    },
    paragraph: {
      fontSize: '1rem',
      color: '#555',
      lineHeight: 1.7,
      marginBottom: '20px'
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
        <h1 style={styles.title}>About SmartWaste Management</h1>
        <p style={styles.subtitle}>
          Committed to sustainable waste management solutions for homes and businesses
        </p>
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Mission</h2>
        <p style={styles.paragraph}>
          At SmartWaste Management, our mission is to provide efficient, eco-friendly waste collection and recycling services
          that make it easy for individuals and businesses to contribute to a cleaner, greener planet. We believe that
          proper waste management is essential for sustainable communities and environmental protection.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Services</h2>
        <p style={styles.paragraph}>
          We offer comprehensive waste management solutions including residential pickup, commercial waste collection,
          recycling services, and dumpster rentals. Our team of trained professionals ensures safe and reliable service
          with a focus on environmental responsibility and customer satisfaction.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
        <ul style={{ paddingLeft: '20px', color: '#555' }}>
          <li style={styles.paragraph}>Reliable and punctual service</li>
          <li style={styles.paragraph}>Eco-friendly practices and recycling focus</li>
          <li style={styles.paragraph}>Competitive pricing with no hidden fees</li>
          <li style={styles.paragraph}>Professional and trained staff</li>
          <li style={styles.paragraph}>Commitment to community and environmental sustainability</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Commitment</h2>
        <p style={styles.paragraph}>
          For over 25 years, we have been dedicated to excellence in waste management. We continuously invest in
          technology and training to improve our services and minimize our environmental impact. Join us in our
          mission to create a cleaner, more sustainable future.
        </p>
      </section>

      <button style={styles.backButton} onClick={() => onNavigate('home')}>
        Back to Home
      </button>
    </div>
  );
}

export default About;
