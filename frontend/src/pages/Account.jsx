import React, { useState } from 'react';

const Account = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('home'); // 'home' or 'business'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Please log in.');
        setTimeout(() => onNavigate('userLogin'), 2000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.signupBox}>
        <h2 style={styles.title}>Create an Account</h2>
        <p style={styles.subtitle}>Join us to manage your waste efficiently.</p>

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
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account? <span onClick={() => onNavigate('userLogin')} style={styles.link}>Log in</span>
        </p>
      </div>
    </div>
  );
};

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
  signupBox: {
    background: 'white',
    padding: 40,
    borderRadius: 20,
    boxShadow: '0 10px 30px rgba(0,61,92,0.08)',
    maxWidth: 400,
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
  success: {
    background: '#e6fffa',
    color: '#2c7a7b',
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
    boxSizing: 'border-box',
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
  loginText: {
    marginTop: '20px',
    color: '#4a5568',
  },
  link: {
    color: '#007872',
    cursor: 'pointer',
    fontWeight: 600,
  },
};

export default Account;