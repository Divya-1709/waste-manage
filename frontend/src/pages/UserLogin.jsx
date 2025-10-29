import React, { useState } from 'react';

const UserLogin = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('home'); // 'home' or 'business'
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (userType === 'business') {
          onNavigate('businessUserDashboard');
        } else {
          onNavigate('userDashboard');
        }
      } else {
        setError(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // This can be enhanced later to handle business account redirects
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Access your waste management portal.</p>

        <div style={styles.userTypeContainer}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="userType"
              value="home"
              checked={userType === 'home'}
              onChange={() => setUserType('home')}
            />
            Home User
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="userType"
              value="business"
              checked={userType === 'business'}
              onChange={() => setUserType('business')}
            />
            Business User
          </label>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Business Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input}
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
            required
            autoComplete="current-password"
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <hr style={styles.hr} />

        <button onClick={handleGoogleLogin} style={styles.googleButton}>
          <img 
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google" 
            style={{ width: 20, marginRight: 10 }}
          />
          Continue with Google
        </button>

        <p style={styles.signupText}>
          Need a business account? <span onClick={() => onNavigate('account')} style={styles.link}>Sign up</span>
        </p>
         <p style={styles.signupText}>
          <span onClick={() => onNavigate('home')} style={styles.link}>Back to Home</span>
        </p>
      </div>
    </div>
  );
};

// Styles can be copied from UserLogin.jsx and adjusted as needed
const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: 'linear-gradient(135deg, #e8f4f8 0%, #d4e9f2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    boxSizing: 'border-box',
  },
  loginBox: {
    background: 'white',
    padding: 40,
    borderRadius: 20,
    boxShadow: '0 10px 30px rgba(0,61,92,0.08)',
    maxWidth: 380,
    width: '100%',
    textAlign: 'center',
  },
    title: {
    fontSize: '2.1rem',
    fontWeight: 800,
    color: '#003d5c',
    marginBottom: 8,
  },
  subtitle: {
    color: '#419988',
    marginBottom: 24,
    fontWeight: 500,
  },
  error: {
    background: '#ffeae9',
    color: '#d32f2f',
    padding: '12px 15px',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: '1rem',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
    border: '1.5px solid #c8d6db',
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 14,
    background: 'linear-gradient(135deg, #003d5c, #007872)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  userTypeContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#4a5568',
  },
  link: {
    color: '#007872',
    cursor: 'pointer',
    fontWeight: 600,
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '24px 0',
  },
  googleButton: {
    width: '100%',
    padding: '12px',
    background: '#fff',
    color: '#333',
    border: '1.5px solid #c8d6db',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    marginTop: '20px',
    color: '#4a5568',
  },
};

export default UserLogin;