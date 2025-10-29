import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Download, RefreshCw, Filter, Calendar, Users, Truck, Briefcase, Package, TrendingUp, Activity } from 'lucide-react';

const GenerateReports = ({ onBack }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Real data from API
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monthly data for bar chart
  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jul', totalWaste: 2.2, recycledWaste: 1.7 },
    { month: 'Aug', totalWaste: 2.5, recycledWaste: 1.9 },
    { month: 'Sep', totalWaste: 2.3, recycledWaste: 1.8 },
    { month: 'Oct', totalWaste: 2.8, recycledWaste: 2.2 },
    { month: 'Nov', totalWaste: 3.0, recycledWaste: 2.3 },
    { month: 'Dec', totalWaste: 2.7, recycledWaste: 2.1 }
  ]);

  // Fetch real data from API
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/reports');
        if (!response.ok) {
          throw new Error('Failed to fetch reports data. Please ensure you are logged in as an admin.');
        }

        const data = await response.json();
        setReportData(data);
        setLastUpdated(new Date(data.lastUpdated || Date.now()));

        // Update monthly data with real trends
        if (data.trends && data.trends.monthly) {
          const formattedMonthlyData = data.trends.monthly.map(d => ({
            ...d,
            month: d.month.split('-')[0] // Extract just the month name, e.g., "Jul" from "Jul-24"
          }));
          setMonthlyData(formattedMonthlyData);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();

    // Auto-refresh functionality
    const interval = setInterval(fetchReportsData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/reports');
      if (!response.ok) {
        throw new Error('Failed to refresh reports data');
      }
      const data = await response.json();
      setReportData(data);
      setLastUpdated(new Date(data.lastUpdated || Date.now()));

      // Update monthly data with real trends
      if (data.trends && data.trends.monthly) {
        const formattedMonthlyData = data.trends.monthly.map(d => ({
          ...d,
          month: d.month.split('-')[0] // Extract just the month name
        }));
        setMonthlyData(formattedMonthlyData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing reports:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = (format) => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      // Create comprehensive CSV with multiple sections
      let csv = 'Smart Waste Management Report\n';
      csv += `Generated: ${new Date().toLocaleString()}\n`;
      csv += `Filter: ${selectedFilter}\n`;
      csv += `Date Range: ${dateRange}\n\n`;

      // Summary Section
      csv += 'SUMMARY OVERVIEW\n';
      csv += 'Category,Total,Active,Inactive/Pending\n';
      csv += `Users,${reportData.summary.users.total},${reportData.summary.users.active},${reportData.summary.users.inactive}\n`;
      csv += `Pickups,${reportData.summary.pickups.total},${reportData.summary.pickups.completed},${reportData.summary.pickups.pending}\n`;
      csv += `Workers,${reportData.summary.workers.total},${reportData.summary.workers.active},${reportData.summary.workers.onLeave}\n`;
      csv += `Vehicles,${reportData.summary.vehicles.total},${reportData.summary.vehicles.active},${reportData.summary.vehicles.maintenance}\n\n`;

      // Key Metrics
      csv += 'KEY METRICS\n';
      csv += 'Metric,Value\n';
      csv += `Waste Collected,${reportData.metrics.wasteCollected} Tons\n`;
      csv += `Recycling Rate,${reportData.metrics.recyclingRate}%\n`;
      csv += `Active Complaints,${reportData.metrics.complaints.active}\n`;
      csv += `Resolved Complaints,${reportData.metrics.complaints.resolved}\n`;
      csv += `Total Complaints,${reportData.metrics.complaints.total}\n\n`;

      // Monthly Trends
      csv += 'MONTHLY TRENDS\n';
      csv += 'Month,Total Waste (Tons),Recycled Waste (Tons)\n';
      monthlyData.forEach(row => {
        csv += `${row.month},${row.totalWaste},${row.recycledWaste}\n`;
      });
      
      const csvBlob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `waste-management-report-${timestamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // Create HTML table that Excel can open
      let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
      html += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
      html += '<x:Name>Waste Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>';
      html += '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>';
      
      // Report Header
      html += '<h1>Smart Waste Management Report</h1>';
      html += `<p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>`;
      html += `<p><strong>Filter:</strong> ${selectedFilter} | <strong>Date Range:</strong> ${dateRange}</p><br/>`;

      // Summary Table
      html += '<h2>Summary Overview</h2>';
      html += '<table border="1" cellpadding="5" cellspacing="0">';
      html += '<tr style="background-color:#4a5568;color:white;"><th>Category</th><th>Total</th><th>Active</th><th>Inactive/Pending</th><th>Efficiency</th></tr>';
      html += `<tr><td>Users</td><td>${reportData.summary.users.total}</td><td>${reportData.summary.users.active}</td><td>${reportData.summary.users.inactive}</td><td>92%</td></tr>`;
      html += `<tr><td>Pickups</td><td>${reportData.summary.pickups.total}</td><td>${reportData.summary.pickups.completed}</td><td>${reportData.summary.pickups.pending}</td><td>88%</td></tr>`;
      html += `<tr><td>Workers</td><td>${reportData.summary.workers.total}</td><td>${reportData.summary.workers.active}</td><td>${reportData.summary.workers.onLeave}</td><td>95%</td></tr>`;
      html += `<tr><td>Vehicles</td><td>${reportData.summary.vehicles.total}</td><td>${reportData.summary.vehicles.active}</td><td>${reportData.summary.vehicles.maintenance}</td><td>90%</td></tr>`;
      html += '</table><br/>';

      // Key Metrics
      html += '<h2>Key Metrics</h2>';
      html += '<table border="1" cellpadding="5" cellspacing="0">';
      html += '<tr style="background-color:#4a5568;color:white;"><th>Metric</th><th>Value</th></tr>';
      html += `<tr><td>Waste Collected</td><td>${reportData.metrics.wasteCollected} Tons</td></tr>`;
      html += `<tr><td>Recycling Rate</td><td>${reportData.metrics.recyclingRate}%</td></tr>`;
      html += `<tr><td>Active Complaints</td><td>${reportData.metrics.complaints.active}</td></tr>`;
      html += `<tr><td>Resolved Complaints</td><td>${reportData.metrics.complaints.resolved}</td></tr>`;
      html += `<tr><td>Total Complaints</td><td>${reportData.metrics.complaints.total}</td></tr>`;
      html += '</table><br/>';

      // Monthly Trends
      html += '<h2>Monthly Trends</h2>';
      html += '<table border="1" cellpadding="5" cellspacing="0">';
      html += '<tr style="background-color:#4a5568;color:white;"><th>Month</th><th>Total Waste (Tons)</th><th>Recycled Waste (Tons)</th></tr>';
      monthlyData.forEach(row => {
        html += `<tr><td>${row.month}</td><td>${row.totalWaste}</td><td>${row.recycledWaste}</td></tr>`;
      });
      html += '</table>';
      
      html += '</body></html>';
      
      const excelBlob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `waste-management-report-${timestamp}.xls`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // PDF export notification
      alert('PDF export functionality will open a print dialog. Please select "Save as PDF" from your printer options.');
      window.print();
    }
  };

  const StatCard = ({ icon: Icon, label, value, subtext, color, bgColor }) => (
    <div 
      className="stat-card"
      style={{ 
        ...styles.statCard, 
        '--card-color': color, 
        '--card-bg-color': bgColor 
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 61, 92, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 61, 92, 0.1)';
      }}
    >
      <div style={styles.statCardContent}>
        <div>
          <p style={styles.statCardLabel}>{label}</p>
          <p style={styles.statCardValue}>{value}</p>
          {subtext && <p style={styles.statCardSubtext}>{subtext}</p>}
        </div>
        <div style={styles.statCardIconWrapper}>
          <Icon size={32} style={styles.statCardIcon} />
        </div>
      </div>
    </div>
  );

  const styles = {
    container: {
      padding: '20px',
      background: '#f7fafc',
    },
    backButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #6c757d, #adb5bd)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
      marginBottom: '20px',
      display: 'inline-block'
    },
    header: {
      background: 'linear-gradient(135deg, #003D5C, #005580)',
      padding: '24px',
      borderRadius: '12px',
      color: 'white',
      marginBottom: '24px',
      boxShadow: '0 4px 20px rgba(0, 61, 92, 0.2)',
    },
    headerFlex: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitleFlex: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    headerIconWrapper: {
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '12px',
      borderRadius: '8px',
    },
    headerTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    headerSubtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: '4px',
    },
    lastUpdated: {
      textAlign: 'right',
    },
    lastUpdatedText: {
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    lastUpdatedTime: {
      fontWeight: '600',
    },
    controlsBar: {
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      boxShadow: '0 4px 20px rgba(0, 61, 92, 0.1)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    },
    controlGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    controlItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
      outline: 'none',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      color: 'white',
      borderRadius: '8px',
      transition: 'background-color 0.2s',
      border: 'none',
      cursor: 'pointer',
    },
    refreshButton: {
      backgroundColor: '#0d9488',
    },
    exportButton: {
      backgroundColor: '#2563eb',
    },
    dropdownContainer: {
      position: 'relative',
    },
    dropdownMenu: {
      position: 'absolute',
      right: 0,
      marginTop: '8px',
      width: '160px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s',
      zIndex: 10,
    },
    dropdownButton: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      padding: '8px 16px',
      backgroundColor: 'transparent',
      color: '#333',
      cursor: 'pointer',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
    },
    statCard: {
      background: 'var(--card-bg-color, #ffffff)',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 61, 92, 0.1)',
      padding: '24px',
      borderLeft: '5px solid var(--card-color, #005580)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    statCardContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statCardLabel: {
      color: '#4a5568',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    statCardValue: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginTop: '8px',
      color: 'var(--card-color, #003D5C)',
    },
    statCardSubtext: {
      color: '#6b7280',
      fontSize: '0.8rem',
      marginTop: '4px',
    },
    statCardIconWrapper: {
      padding: '12px',
      borderRadius: '50%',
      backgroundColor: 'var(--card-bg-color)',
      color: 'var(--card-color)',
      opacity: 0.2,
    },
    chartContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 61, 92, 0.1)',
      padding: '24px',
    },
    chartTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
    },
    titleMarker: {
      width: '4px',
      height: '24px',
      marginRight: '12px',
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      marginBottom: '32px',
    },
    summaryTableContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 61, 92, 0.1)',
      padding: '24px',
      marginTop: '24px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#4a5568',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      backgroundColor: '#f9fafb',
    },
    td: {
      padding: '16px',
      whiteSpace: 'nowrap',
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
    },
    tableCellFlex: {
      display: 'flex',
      alignItems: 'center',
    },
    statusBadge: {
      padding: '4px 8px',
      fontSize: '0.75rem',
      fontWeight: '600',
      borderRadius: '9999px',
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">Error Loading Reports</div>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 text-lg">No report data available</div>
        </div>
      </div>
    );
  }

  // Define data for pie charts
  const pieData = [
    { name: 'Users', value: reportData.summary.users.total, color: '#2563eb' },
    { name: 'Pickups', value: reportData.summary.pickups.total, color: '#16a34a' },
    { name: 'Workers', value: reportData.summary.workers.total, color: '#d97706' },
    { name: 'Vehicles', value: reportData.summary.vehicles.total, color: '#7c3aed' },
  ];

  const distributionData = [
    { name: 'Active Users', value: reportData.summary.users.active, color: '#2563eb' },
    { name: 'Active Workers', value: reportData.summary.workers.active, color: '#d97706' },
    { name: 'Active Vehicles', value: reportData.summary.vehicles.active, color: '#7c3aed' },
    { name: 'Completed Pickups', value: reportData.summary.pickups.completed, color: '#16a34a' },
  ];

  return (
    <div style={styles.container}>
      {onBack && (
        <button
          style={styles.backButton}
          onClick={onBack}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
          }}
        >
          ← Back to Dashboard
        </button>
      )}
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerFlex}>
          <div style={styles.headerTitleFlex}>
            <div style={styles.headerIconWrapper}>
              <FileText size={32} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Generate Reports</h1>
              <p style={styles.headerSubtitle}>Comprehensive data analytics and insights</p>
            </div>
          </div>
          <div style={styles.lastUpdated}>
            <p style={styles.lastUpdatedText}>Last Updated</p>
            <p style={styles.lastUpdatedTime}>{lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8" style={{padding: 0}}>
        {/* Controls Bar */}
        <div style={styles.controlsBar}>
          <div style={styles.controlGroup}>
            <div style={styles.controlItem}>
              <Filter size={20} color="#4a5568" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Data</option>
                <option value="users">Users Only</option>
                <option value="pickups">Pickups Only</option>
                <option value="workers">Workers Only</option>
                <option value="vehicles">Vehicles Only</option>
              </select>
            </div>

            <div style={styles.controlItem}>
              <Calendar size={20} color="#4a5568" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={styles.select}
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          <div style={styles.controlGroup}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{ ...styles.button, ...styles.refreshButton }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <div className="group" style={styles.dropdownContainer}>
              <button style={{ ...styles.button, ...styles.exportButton }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                <Download size={20} />
                <span>Export</span>
              </button>
              <div style={styles.dropdownMenu} className="opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                <button
                  onClick={() => handleExport('csv')}
                  style={{...styles.dropdownButton, borderRadius: '8px 8px 0 0'}}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  style={styles.dropdownButton}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  style={{...styles.dropdownButton, borderRadius: '0 0 8px 8px'}}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Save as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={styles.statsGrid}>
          <StatCard
            icon={Users}
            label="Total Users"
            value={reportData.summary.users.total}
            subtext={`${reportData.summary.users.active} active`}
            color="#2563eb"
            bgColor="#eff6ff"
          />
          <StatCard
            icon={Package}
            label="Total Pickups"
            value={reportData.summary.pickups.total}
            subtext={`${reportData.summary.pickups.pending} pending`}
            color="#16a34a"
            bgColor="#f0fdf4"
          />
          <StatCard
            icon={Briefcase}
            label="Total Workers"
            value={reportData.summary.workers.total}
            subtext={`${reportData.summary.workers.active} active`}
            color="#d97706"
            bgColor="#fffbeb"
          />
          <StatCard
            icon={Truck}
            label="Total Vehicles"
            value={reportData.summary.vehicles.total}
            subtext={`${reportData.summary.vehicles.active} operational`}
            color="#7c3aed"
            bgColor="#f5f3ff"
          />
        </div>

        {/* Additional Metrics */}
        <div style={{...styles.statsGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
          <div style={styles.chartContainer}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{color: '#4a5568', fontSize: '0.875rem', fontWeight: 500}}>Waste Collected</p>
                <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', marginTop: '8px'}}>{reportData.metrics.wasteCollected}T</p>
                <div style={{display: 'flex', alignItems: 'center', marginTop: '8px'}}>
                  <TrendingUp size={16} color="#16a34a" style={{marginRight: '4px'}} />
                  <span style={{color: '#16a34a', fontSize: '0.875rem'}}>+12% this month</span>
                </div>
              </div>
              <Activity size={48} color="#16a34a" />
            </div>
          </div>

          <div style={styles.chartContainer}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{color: '#4a5568', fontSize: '0.875rem', fontWeight: 500}}>Recycling Rate</p>
                <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginTop: '8px'}}>{reportData.metrics.recyclingRate}%</p>
                  <div style={{width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '8px', marginTop: '12px'}}>
                  <div
                    style={{backgroundColor: '#2563eb', height: '8px', borderRadius: '9999px', transition: 'all 0.5s', width: `${reportData.metrics.recyclingRate}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.chartContainer}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{color: '#4a5568', fontSize: '0.875rem', fontWeight: 500}}>Active Complaints</p>
                <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#ea580c', marginTop: '8px'}}>{reportData.metrics.complaints.active}</p>
                <p style={{color: '#6b7280', fontSize: '0.875rem', marginTop: '8px'}}>
                  {reportData.metrics.complaints.resolved} resolved / {reportData.metrics.complaints.total} total
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Charts Section */}
        <div style={styles.chartsGrid}>
          {/* Pie Chart - Overview */}
          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>
              <div style={{...styles.titleMarker, backgroundColor: '#0d9488'}}></div>
              Resource Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Status Distribution */}
          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>
              <div style={{...styles.titleMarker, backgroundColor: '#2563eb'}}></div>
              Active Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>
            <div style={{...styles.titleMarker, backgroundColor: '#7e22ce'}}></div>
            Monthly Waste Analysis (in Tons)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Waste (Tons)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalWaste" fill="#8884d8" name="Total Waste" />
              <Bar dataKey="recycledWaste" fill="#82ca9d" name="Recycled Waste" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Table */}
        <div style={styles.summaryTableContainer}>
          <h3 style={styles.chartTitle}>
            <div style={{...styles.titleMarker, backgroundColor: '#16a34a'}}></div>
            Detailed Summary Report
          </h3>
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Active</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.tableCellFlex}>
                      <Users size={20} color="#2563eb" style={{marginRight: '8px'}} />
                      <span style={{fontWeight: 500}}>Users</span>
                    </div>
                  </td>
                  <td style={styles.td}>{reportData.summary.users.total}</td>
                  <td style={styles.td}>{reportData.summary.users.active}</td>
                  <td style={styles.td}>
                    <span style={{...styles.statusBadge, backgroundColor: '#dcfce7', color: '#166534'}}>Active</span>
                  </td>
                  <td style={styles.td}>{reportData.efficiency.users}%</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.tableCellFlex}>
                      <Package size={20} color="#16a34a" style={{marginRight: '8px'}} />
                      <span style={{fontWeight: 500}}>Pickups</span>
                    </div>
                  </td>
                  <td style={styles.td}>{reportData.summary.pickups.total}</td>
                  <td style={styles.td}>{reportData.summary.pickups.completed}</td>
                  <td style={styles.td}>
                    <span style={{...styles.statusBadge, backgroundColor: '#fef9c3', color: '#854d0e'}}>In Progress</span>
                  </td>
                  <td style={styles.td}>{reportData.efficiency.pickups}%</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.tableCellFlex}>
                      <Briefcase size={20} color="#ea580c" style={{marginRight: '8px'}} />
                      <span style={{fontWeight: 500}}>Workers</span>
                    </div>
                  </td>
                  <td style={styles.td}>{reportData.summary.workers.total}</td>
                  <td style={styles.td}>{reportData.summary.workers.active}</td>
                  <td style={styles.td}>
                    <span style={{...styles.statusBadge, backgroundColor: '#dcfce7', color: '#166534'}}>Active</span>
                  </td>
                  <td style={styles.td}>{reportData.efficiency.workers}%</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={{...styles.tableCellFlex}}>
                      <Truck size={20} color="#7e22ce" style={{marginRight: '8px'}} />
                      <span style={{fontWeight: 500}}>Vehicles</span>
                    </div>
                  </td>
                  <td style={styles.td}>{reportData.summary.vehicles.total}</td>
                  <td style={styles.td}>{reportData.summary.vehicles.active}</td>
                  <td style={styles.td}>
                    <span style={{...styles.statusBadge, backgroundColor: '#dcfce7', color: '#166534'}}>Operational</span>
                  </td>
                  <td style={styles.td}>{reportData.efficiency.vehicles}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateReports;