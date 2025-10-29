import React from 'react';
import { useTranslation } from 'react-i18next';

function Services({ onNavigate }) {
  const { t } = useTranslation();

  const wasteTypes = [
    { icon: '🌿', title: 'Garbage Pickup', description: 'Schedule bulk & regular garbage removal on-demand or in a flat fee.' },
    { icon: '📦', title: 'Electronic Waste', description: 'We offer proper disposal for TVs, monitors, computers & e-waste that needs recycling.' },
    { icon: '♻️', title: 'Consumer Rental', description: 'Get bulk 2-day garbage bin rental for projects, cleanups, or home renovations.' }
  ];

  const commercialServices = [
    {
      icon: '🏪',
      title: 'Commercial Waste Collection',
      description: 'No contracts, flat rate pricing and consistently reliable pickup of your commercial business waste.'
    },
    {
      icon: '🚛',
      title: 'Roll-off Dumpster Rental',
      description: 'Get dumpsters in varying sizes to handle construction debris, renovation waste, or large commercial cleanups.'
    },
    {
      icon: '♻️',
      title: 'Commercial Waste Compactors',
      description: 'Reduce waste volume with our waste compactor rentals and services. Save space and reduce pickups.'
    }
  ];

  const residentialServices = [
    {
      icon: '🗑️',
      title: 'Residential Trash Pickup',
      description: 'Convenient weekly trash collection service for your home with flexible scheduling options.'
    },
    {
      icon: '♻️',
      title: 'Residential Recycling',
      description: 'Comprehensive recycling services for paper, plastic, glass, and metal materials from your home.'
    },
    {
      icon: '🏡',
      title: 'Residential Dumpster Rental',
      description: 'Perfect for home cleanouts, renovations, or landscaping projects with various size options.'
    }
  ];

  const styles = {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#333',
      lineHeight: 1.6,
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '60px'
    },
    title: {
      fontSize: '3rem',
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
      marginBottom: '80px'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#003d5c',
      marginBottom: '50px',
      textAlign: 'center'
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
      marginBottom: '40px'
    },
    card: {
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      textAlign: 'center'
    },
    cardIcon: {
      fontSize: '3rem',
      marginBottom: '15px'
    },
    cardTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#003d5c',
      marginBottom: '15px'
    },
    cardDescription: {
      color: '#666',
      lineHeight: 1.6,
      marginBottom: '20px'
    },
    learnMoreBtn: {
      color: '#28307cff',
      fontWeight: '600',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    commercialSection: {
      background: 'linear-gradient(135deg, #003d5c 0%, #005a8c 100%)',
      color: 'white',
      padding: '80px 20px',
      borderRadius: '20px',
      margin: '40px 0'
    },
    commercialGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '50px',
      alignItems: 'center'
    },
    commercialContent: {
      maxWidth: '500px'
    },
    commercialImage: {
      width: '100%',
      height: '400px',
      objectFit: 'cover',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
    },
    serviceList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    serviceItem: {
      background: 'rgba(255,255,255,0.1)',
      padding: '25px',
      borderRadius: '15px',
      marginBottom: '20px',
      backdropFilter: 'blur(10px)'
    },
    ctaSection: {
      background: 'linear-gradient(135deg, #114b72ff, #75d2eeff)',
      color: 'white',
      padding: '60px 20px',
      textAlign: 'center',
      borderRadius: '20px',
      margin: '40px 0'
    },
    ctaTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '20px'
    },
    ctaText: {
      fontSize: '1.2rem',
      marginBottom: '30px',
      maxWidth: '600px',
      margin: '0 auto 30px'
    },
    primaryBtn: {
      padding: '15px 40px',
      background: '#0f4c75ff',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1.1rem',
      margin: '0 10px'
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
        <h1 style={styles.title}>Our Services</h1>
        <p style={styles.subtitle}>
          Comprehensive waste management solutions for residential and commercial needs
        </p>
      </div>

      {/* Waste Types Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Waste Collection Services</h2>
        <div style={styles.cardsGrid}>
          {wasteTypes.map((type, index) => (
            <div
              key={index}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.cardIcon}>{type.icon}</div>
              <h3 style={styles.cardTitle}>{type.title}</h3>
              <p style={styles.cardDescription}>{type.description}</p>
              <span style={styles.learnMoreBtn}>Learn More →</span>
            </div>
          ))}
        </div>
      </section>

      {/* Commercial Services Section */}
      <section style={styles.commercialSection}>
        <h2 style={{...styles.sectionTitle, color: 'white'}}>Commercial Services</h2>
        <div style={styles.commercialGrid}>
          <div style={styles.commercialContent}>
            <ul style={styles.serviceList}>
              {commercialServices.map((service, index) => (
                <li key={index} style={styles.serviceItem}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{service.icon}</div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>{service.title}</h3>
                  <p style={{ opacity: 0.9 }}>{service.description}</p>
                </li>
              ))}
            </ul>
            <button
              style={{...styles.primaryBtn, marginTop: '30px', background: 'white', color: '#003d5c'}}
              onClick={() => onNavigate('userLogin')}
            >
              Schedule Commercial Service
            </button>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600"
              alt="Commercial Services"
              style={styles.commercialImage}
            />
          </div>
        </div>
      </section>

      {/* Residential Services Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Residential Services</h2>
        <div style={styles.commercialGrid}>
          <div>
            <img
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600"
              alt="Residential Services"
              style={styles.commercialImage}
            />
          </div>
          <div style={styles.commercialContent}>
            {residentialServices.map((service, index) => (
              <div key={index} style={{...styles.card, marginBottom: '20px'}}>
                <div style={styles.cardIcon}>{service.icon}</div>
                <h3 style={styles.cardTitle}>{service.title}</h3>
                <p style={styles.cardDescription}>{service.description}</p>
                <span style={styles.learnMoreBtn}>Learn More →</span>
              </div>
            ))}
            <button
              style={styles.primaryBtn}
              onClick={() => onNavigate('userLogin')}
            >
              Schedule Residential Service
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
        <p style={styles.ctaText}>
          Contact us today to schedule your waste collection service or get a quote for your specific needs.
        </p>
        <div>
          <button
            style={{...styles.primaryBtn, background: 'white', color: '#2E7D32'}}
            onClick={() => onNavigate('userLogin')}
          >
            Get Started
          </button>
          <button
            style={{...styles.primaryBtn, background: 'transparent', border: '2px solid white'}}
            onClick={() => onNavigate('contact')}
          >
            Contact Us
          </button>
        </div>
      </section>

      <button style={styles.backButton} onClick={() => onNavigate('home')}>
        Back to Home
      </button>
    </div>
  );
}

export default Services;
