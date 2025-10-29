import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';

function Home({ onNavigate }) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { t } = useTranslation();

  const services = [
    { icon: '🗑️', title: 'Pickup Schedulle', description: 'Regular collection services' },
    { icon: '♻️', title: 'Recycling', description: 'Eco-friendly recycling solutions' },
    { icon: '🏢', title: 'Commercial', description: 'Business waste management' },
    { icon: '🏠', title: 'Residential', description: 'Home waste collection' }
  ];

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

  const qualityPoints = [
    {
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      title: 'Better Planet',
      description: 'We are committed to sustainability and eco-friendly waste management practices that protect our environment.'
    },
    {
      image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400',
      title: 'Safety Above All',
      description: 'Our trained professionals follow strict safety protocols to ensure secure handling of all waste materials.'
    },
    {
      image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400',
      title: 'Job Creation',
      description: 'Creating employment opportunities and supporting local communities through our waste management services.'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      rating: 5,
      text: 'The service is fantastic. They always show up on time and handle everything professionally. Highly recommended!'
    },
    {
      name: 'Priya Sharma',
      rating: 5,
      text: 'Excellent waste management service. Very reliable and the team is always courteous and efficient.'
    },
    {
      name: 'Amit Patel',
      rating: 5,
      text: 'Best decision for our business. They handle all our commercial waste needs perfectly. Great service!'
    }
  ];

  const styles = {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#333',
      lineHeight: 1.6
    },

    // Navbar
    navbar: {
      background: 'white',
      padding: '15px 50px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },

    logo: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#074c7aff'
    },

    navLinks: {
      display: 'flex',
      gap: '30px',
      alignItems: 'center'
    },

    navLink: {
      color: '#333',
      textDecoration: 'none',
      fontWeight: '500',
      cursor: 'pointer'
    },

    loginButton: {
      padding: '10px 25px',
      background: '#2285beff',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '600'
    },

    // Hero Section
    hero: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '50px',
      padding: '80px 50px',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #94c6eeff 0%, #6daab4ff 100%)'
    },

    heroContent: {
      maxWidth: '600px'
    },

    heroTitle: {
      fontSize: '3rem',
      fontWeight: '800',
      color: '#03284bb0',
      marginBottom: '20px',
      lineHeight: 1.2
    },

    heroSubtitle: {
      fontSize: '1.1rem',
      color: '#666',
      marginBottom: '30px',
      lineHeight: 1.6
    },

    heroButtons: {
      display: 'flex',
      gap: '15px',
      marginBottom: '30px'
    },

    primaryBtn: {
      padding: '12px 30px',
      background: '#0f4c75ff',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem'
    },

    secondaryBtn: {
      padding: '12px 30px',
      background: 'transparent',
      color: '#1c1672ff',
      border: '2px solid #241e7aef',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem'
    },

    serviceIcons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '15px'
    },

    serviceIcon: {
      background: 'white',
      padding: '20px',
      borderRadius: '15px',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },

    heroImage: {
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '10px solid white',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
    },

    // Waste Types Section
    section: {
      padding: '80px 50px',
      maxWidth: '1400px',
      margin: '0 auto'
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
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '30px',
      marginBottom: '40px'
    },

    card: {
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
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

    // Commercial Services
    commercialSection: {
      background: 'linear-gradient(135deg, #003d5c 0%, #005a8c 100%)',
      color: 'white',
      padding: '80px 50px'
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

    // CTA Banner
    ctaBanner: {
      background: 'linear-gradient(135deg, #114b72ff, #75d2eeff)',
      color: 'white',
      padding: '50px',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    ctaText: {
      fontSize: '1.8rem',
      fontWeight: '700'
    },

    ctaButtons: {
      display: 'flex',
      gap: '15px'
    },

    // Quality Section
    qualitySection: {
      padding: '80px 50px',
      textAlign: 'center'
    },

    qualityGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '30px'
    },

    qualityCard: {
      background: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    },

    qualityImage: {
      width: '100%',
      height: '250px',
      objectFit: 'cover'
    },

    qualityContent: {
      padding: '25px'
    },

    // Join Team Section
    joinTeam: {
      background: 'linear-gradient(135deg, #003d5c, #005a8c)',
      color: 'white',
      padding: '60px 50px',
      textAlign: 'center',
      borderRadius: '20px',
      margin: '40px 50px'
    },

    // Testimonials
    testimonialSection: {
      padding: '80px 50px',
      background: '#f9f9f9'
    },

    testimonialGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '30px'
    },

    testimonialCard: {
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
    },

    rating: {
      color: '#FFD700',
      fontSize: '1.2rem',
      marginBottom: '15px'
    },

    // Footer
    footer: {
      background: '#003d5c',
      color: 'white',
      padding: '60px 50px 30px',
      marginTop: '80px'
    },

    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '40px',
      marginBottom: '40px'
    },

    footerTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: '20px'
    },

    footerLinks: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },

    footerLink: {
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '10px',
      cursor: 'pointer'
    },

    footerBottom: {
      borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingTop: '30px',
      textAlign: 'center',
      color: 'rgba(255,255,255,0.7)'
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>{t('logo')}</div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => onNavigate('services')}>{t('services')}</span>
          <span style={styles.navLink} onClick={() => onNavigate('about')}>{t('about')}</span>
          <span style={styles.navLink} onClick={() => onNavigate('contact')}>{t('contact')}</span>
          <button style={{...styles.secondaryBtn, padding: '8px 20px', fontSize: '0.9rem'}} onClick={() => onNavigate('adminLogin')}>
            Admin Login
          </button>
          <button style={styles.loginButton} onClick={() => onNavigate('userLogin')}>
            {t('my_account')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Waste Pickup
          </h1>
          <p style={styles.heroSubtitle}>
            We make waste disposal and recycling easy for your home or business with reliable, 
            eco-friendly collection services.
          </p>
          <div style={styles.heroButtons}>
            <button style={styles.primaryBtn} onClick={() => onNavigate('userLogin')}>
              Get Started Now
            </button>
        
             <button
  style={styles.secondaryBtn}
  onClick={() => onNavigate('account')}
>
  View Services
</button>


          </div>
          <div style={styles.serviceIcons}>
            {services.map((service, index) => (
              <div
                key={index}
                style={styles.serviceIcon}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => {
                  if (service.title === 'Pickup Schedulle') {
                    onNavigate('userLogin');
                  }
                }}
              >
                <div style={{ fontSize: '2rem' }}>{service.icon}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', marginTop: '8px' }}>
                  {service.title}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <img 
            src="https://img.freepik.com/premium-photo/portrait-sanitation-worker-uniform-holding-two-large-garbage-bags-trash-picker_605022-25795.jpg?w=2000" 
            alt="Garbage collection"
            style={styles.heroImage}
          />
        </div>
      </section>

      {/* Waste Types Section */}
      <section style={styles.section}>
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
        <h2 style={{...styles.sectionTitle, color: 'white'}}>Our Commercial Services</h2>
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
            >
              Schedule Service
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

      {/* CTA Banner */}
      <div style={styles.ctaBanner}>
        <div style={styles.ctaText}>
          Say goodbye to waste and hello to savings<br/>
          with Waste Connections!
        </div>
        <div style={styles.ctaButtons}>
          <button style={{...styles.primaryBtn, background: 'white', color: '#2E7D32'}}>
            Get Started
          </button>
          <button style={{...styles.secondaryBtn, borderColor: 'white', color: 'white'}}>
            +91 98765 43210
          </button>
        </div>
      </div>

      {/* Residential Services Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Residential Services</h2>
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
          </div>
        </div>
      </section>

      {/* Quality Service Section */}
      <section style={styles.qualitySection}>
        <h2 style={styles.sectionTitle}>Quality Service for Over 25 Years</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '800px', margin: '0 auto 50px', lineHeight: 1.6 }}>
          We have been providing exceptional waste management services with a commitment to 
          sustainability, safety, and community support.
        </p>
        <div style={styles.qualityGrid}>
          {qualityPoints.map((point, index) => (
            <div 
              key={index} 
              style={styles.qualityCard}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src={point.image} alt={point.title} style={styles.qualityImage} />
              <div style={styles.qualityContent}>
                <h3 style={styles.cardTitle}>{point.title}</h3>
                <p style={styles.cardDescription}>{point.description}</p>
                <span style={styles.learnMoreBtn}>Learn More →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join Team Section */}
      <section style={styles.joinTeam}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>JOIN OUR TEAM!</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9, maxWidth: '700px', margin: '0 auto 30px' }}>
          Be part of a company that values sustainability, innovation, and community. 
          We're always looking for passionate individuals to join our growing team.
        </p>
        <button style={{...styles.primaryBtn, background: 'white', color: '#003d5c', fontSize: '1.1rem'}}>
          Apply Now
        </button>
      </section>

      {/* Testimonials Section */}
      <section style={styles.testimonialSection}>
        <h2 style={styles.sectionTitle}>Choose Waste Connections</h2>
        <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#666', marginBottom: '50px' }}>
          See what our customers have to say about our services
        </p>
        <div style={styles.testimonialGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} style={styles.testimonialCard}>
              <div style={styles.rating}>
                {'★'.repeat(testimonial.rating)}
              </div>
              <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                "{testimonial.text}"
              </p>
              <div style={{ fontWeight: '600', color: '#003d5c' }}>{testimonial.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile App Section */}
      <section style={{...styles.section, background: '#003d5c', color: 'white', borderRadius: '20px', margin: '0 50px 80px'}}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>
              Never Miss Your Collection<br/>Day Again!
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem', lineHeight: 2 }}>
              <li>✓ Get customizable notifications based on your service day</li>
              <li>✓ View your service calendar and billing information</li>
              <li>✓ Receive educational tips for recycling and disposal</li>
              <li>✓ Report missed pickups and service issues instantly</li>
            </ul>
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button style={{...styles.primaryBtn, background: 'white', color: '#003d5c'}}>
                Download App
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img 
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400" 
              alt="Mobile App"
              style={{ maxWidth: '300px', borderRadius: '20px' }}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <h3 style={styles.footerTitle}>Company</h3>
            <ul style={styles.footerLinks}>
              <li style={styles.footerLink}>About Us</li>
              <li style={styles.footerLink}>Careers</li>
              <li style={styles.footerLink}>Press</li>
              <li style={styles.footerLink}>Blog</li>
            </ul>
          </div>
          <div>
            <h3 style={styles.footerTitle}>Services</h3>
            <ul style={styles.footerLinks}>
              <li style={styles.footerLink}>Residential</li>
              <li style={styles.footerLink}>Commercial</li>
              <li style={styles.footerLink}>Recycling</li>
              <li style={styles.footerLink}>Dumpster Rental</li>
            </ul>
          </div>
          <div>
            <h3 style={styles.footerTitle}>Support</h3>
            <ul style={styles.footerLinks}>
              <li style={styles.footerLink}>Help Center</li>
              <li style={styles.footerLink}>Contact Us</li>
              <li style={styles.footerLink}>FAQs</li>
              <li style={styles.footerLink}>Service Areas</li>
            </ul>
          </div>
          <div>
            <h3 style={styles.footerTitle}>Contact</h3>
            <ul style={styles.footerLinks}>
              <li style={styles.footerLink}>📞 +91 98765 43210</li>
              <li style={styles.footerLink}>📧 support@smartwaste.com</li>
              <li style={styles.footerLink}>📍 Chennai, Tamil Nadu</li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2025 SmartWaste Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;