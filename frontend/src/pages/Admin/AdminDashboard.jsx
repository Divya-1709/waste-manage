import React, { useState, useEffect } from 'react';
import { Users, Truck, Briefcase, MapPin, BarChart2, LogOut, MessageSquare, LayoutDashboard } from 'lucide-react';

import UserManagement from './UserManagement';
import ManageWorkers from './ManageWorkers';
import VehicleManagement from './VechileManagement';
import PickupAssignment from './PickupAssignment';
import GenerateReports from './GenerateReports';
import ComplaintManagement from './ComplaintManagement';

const AdminDashboard = ({ onNavigate }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [users, setUsers] = useState([]); // This will be fetched from API
  const [workers, setWorkers] = useState([]); // This will be fetched from API
  const [vehicles, setVehicles] = useState([]); // This will be fetched from API
  const [pickups, setPickups] = useState([]); // This will be fetched from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // We'll use Promise.all to fetch everything concurrently
        const [usersRes, vehiclesRes, pickupsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/vehicles'),
          fetch('/api/admin/pickups'),
        ]);

        if (!usersRes.ok || !vehiclesRes.ok || !pickupsRes.ok) {
          throw new Error('Failed to fetch data. Please ensure you are logged in as an admin.');
        }

        const usersData = await usersRes.json();
        const vehiclesData = await vehiclesRes.json();
        const pickupsData = await pickupsRes.json();

        // The backend uses _id, so let's map it to id for frontend consistency
        setUsers(usersData.map(u => ({ ...u, id: u._id })));
        setVehicles(vehiclesData.map(v => ({ ...v, id: v._id })));
        setPickups(pickupsData.map(p => ({ ...p, id: p._id })));

      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    // Clear auth token/cookie here
    onNavigate('home');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement onBack={() => setActiveView('dashboard')} users={users} setUsers={setUsers} />;
      case 'workers':
        return <ManageWorkers onBack={() => setActiveView('dashboard')} />;
      case 'vehicles':
        return <VehicleManagement onBack={() => setActiveView('dashboard')} vehicles={vehicles} setVehicles={setVehicles} />;
      case 'pickups':
        return <PickupAssignment onBack={() => setActiveView('dashboard')} pickups={pickups} setPickups={setPickups} />;
      case 'reports':
        return <GenerateReports onBack={() => setActiveView('dashboard')} />;
      case 'complaints':
        return <ComplaintManagement onBack={() => setActiveView('dashboard')} />;
      default:
        return renderDashboard();
    }
  };

  const DashboardCard = ({ title, icon, onClick, count, description }) => (
    <div
      style={styles.card}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={styles.cardIcon}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardDescription}>{description}</p>
      {count !== undefined && <div style={styles.cardCount}>{count}</div>}
    </div>
  );

  if (loading) {
    return <div style={{ ...styles.container, ...styles.centered }}>Loading Admin Dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ ...styles.container, ...styles.centered, color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const renderDashboard = () => (
    <>
      <div style={styles.header}>
        <div style={{width: '100%'}}>
          <p style={styles.subtitle}>Welcome back, Admin! Manage your operations from here.</p>
        </div>
      </div>
      <div style={styles.grid}>
        <DashboardCard
          title="Manage Users"
          icon={<Users size={32} />}
          onClick={() => setActiveView('users')}
          count={users.length}
          description="View, edit, and manage registered users."
        />
        <DashboardCard
          title="Manage Workers"
          icon={<Briefcase size={32} />}
          onClick={() => setActiveView('workers')}
          description="Add, edit, and track your workforce."
        />
        <DashboardCard
          title="Manage Vehicles"
          icon={<Truck size={32} />}
          onClick={() => setActiveView('vehicles')}
          count={vehicles.length}
          description="Manage your fleet of waste collection vehicles."
        />
        <DashboardCard
          title="Assign Pickups"
          icon={<MapPin size={32} />}
          onClick={() => setActiveView('pickups')}
          count={pickups.filter(p => p.status === 'pending').length}
          description="Assign pending pickup requests to workers."
        />
        <DashboardCard
          title="Generate Reports"
          icon={<BarChart2 size={32} />}
          onClick={() => setActiveView('reports')}
          description="Get insights and analytics on operations."
        />
        <DashboardCard
          title="Manage Complaints"
          icon={<MessageSquare size={32} />}
          onClick={() => setActiveView('complaints')}
          description="Handle user complaints and feedback."
        />
      </div>
    </>
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <LayoutDashboard size={32} style={{color: '#10b981'}} />
          <h2 style={styles.sidebarTitle}>Admin Panel</h2>
        </div>
        <nav style={styles.nav}>
          <button style={{...styles.navItem, ...(activeView === 'dashboard' && styles.navItemActive)}} onClick={() => setActiveView('dashboard')}>
            <BarChart2 size={20} />
            <span>Dashboard</span>
          </button>
          <button style={{...styles.navItem, ...(activeView === 'users' && styles.navItemActive)}} onClick={() => setActiveView('users')}>
            <Users size={20} />
            <span>Manage Users</span>
          </button>
          <button style={{...styles.navItem, ...(activeView === 'workers' && styles.navItemActive)}} onClick={() => setActiveView('workers')}>
            <Briefcase size={20} />
            <span>Manage Workers</span>
          </button>
          <button style={{...styles.navItem, ...(activeView === 'vehicles' && styles.navItemActive)}} onClick={() => setActiveView('vehicles')}>
            <Truck size={20} />
            <span>Manage Vehicles</span>
          </button>
          <button style={{...styles.navItem, ...(activeView === 'pickups' && styles.navItemActive)}} onClick={() => setActiveView('pickups')}>
            <MapPin size={20} />
            <span>Assign Pickups</span>
          </button>
          <button style={{...styles.navItem, ...(activeView === 'reports' && styles.navItemActive)}} onClick={() => setActiveView('reports')}>
            <BarChart2 size={20} />
            <span>Generate Reports</span>
          </button>
          <button style={{...styles.navItem, ...(activeView === 'complaints' && styles.navItemActive)}} onClick={() => setActiveView('complaints')}>
            <MessageSquare size={20} />
            <span>Complaints</span>
          </button>
        </nav>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.topBarTitle}>Home Maintenance</h1>
            <p style={styles.topBarSubtitle}>Monitor and manage residential waste operations</p>
          </div>
          <button 
            style={styles.logoutButton} 
            onClick={handleLogout}
            onMouseEnter={(e) => e.currentTarget.style.background = '#C53030'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#E53E3E'}
          >
            <LogOut size={18} style={{ marginRight: '8px' }} />
            Logout
          </button>
        </div>
        <div style={styles.contentArea}>
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { // Changed from page to container
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
  },
  sidebar: {
    width: '280px',
    background: '#003D5C',
    color: 'white',
    padding: '30px 20px',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    background: 'white',
    padding: '20px 40px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0,
  },
  topBarSubtitle: {
    fontSize: '1rem',
    color: '#718096',
    marginTop: '4px',
  },
  contentArea: {
    padding: '40px',
    overflow: 'auto',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    flex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '2px solid #d1d5db',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#4a5568',
    marginTop: '5px',
  },
  logoutButton: {
    padding: '10px 20px',
    background: '#E53E3E',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    display: 'flex',
    alignItems: 'center',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(0, 61, 92, 0.1)',
  },
  cardIcon: {
    color: '#005580',
    marginBottom: '15px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#003D5C',
    margin: '0 0 10px 0',
  },
  cardDescription: {
    fontSize: '1rem',
    color: '#718096',
    lineHeight: '1.5',
  },
  cardCount: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: '#e8f4f8',
    color: '#003D5C',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
};

export default AdminDashboard;