import React, { useState } from 'react';

const AdminLogin = ({ onNavigate }) => {
  const [email, setEmail] = useState('admin@nec.edu.in');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // To send/receive cookies
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // Store token if returned (though cookie is set server-side)
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
        }
        onNavigate('dashboard');
      } else {
        setError(data.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>
          <span style={styles.brandIcon}>⚙️</span> Admin Login
        </h2>
        <p style={styles.subtitle}>
          Only authorized SmartWaste administrators may access this page.
        </p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            autoComplete="current-password"
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <button
          style={styles.backBtn}
          onClick={() => onNavigate('home')}
          onMouseEnter={e => {
            e.target.style.background = '#d32f2f';
            e.target.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.target.style.background = '#fff';
            e.target.style.color = '#d32f2f';
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #e8f4f8 0%, #d4e9f2 100%)',
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    background: 'white',
    padding: '50px 32px 36px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,61,92, 0.08)',
    textAlign: 'center',
    minWidth: '320px',
    maxWidth: '370px'
  },
  title: {
    fontSize: '2.1rem',
    fontWeight: 800,
    color: '#003d5c',
    letterSpacing: '1px',
  },
  subtitle: {
    color: '#419988',
    marginBottom: 28,
    marginTop: -6,
    fontWeight: 500,
    fontSize: '1.05rem'
  },
  brandIcon: {
    fontSize: '2rem',
    verticalAlign: 'middle',
    marginRight: 8
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '12px 0 8px 0',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    background: '#f8fafb',
    fontSize: '1rem',
    transition: 'border 0.2s',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #003d5c, #007872)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '1.05rem',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0px 5px 18px rgba(30, 150, 165, 0.08)',
    transition: 'background 0.2s'
  },
  error: {
    background: '#ffeae9',
    color: '#d32f2f',
    padding: '11px 10px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.99rem',
    marginBottom: 6,
    marginTop: -10,
  },
  backBtn: {
    background: '#fff',
    color: '#d32f2f',
    fontWeight: 600,
    marginTop: 28,
    border: '2px solid #d32f2f',
    borderRadius: 8,
    padding: '9px 0',
    width: '100%',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.13s'
  }
};

export default AdminLogin;
