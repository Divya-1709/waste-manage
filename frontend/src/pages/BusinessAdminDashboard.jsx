import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Truck, ClipboardCheck, BarChart2, FileText, Award, Heart, DollarSign, Search, Filter, Download, Eye, Check, X, TrendingUp, Package, Leaf, MapPin } from 'lucide-react';

const AdminBusinessDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [businessRequests, setBusinessRequests] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [donations, setDonations] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pickupsRes, workersRes] = await Promise.all([
          axios.get('/api/admin/pickups'),
          axios.get('/api/admin/workers')
        ]);

        // Filter business pickups and map to frontend format
        const businessPickups = pickupsRes.data.filter(pickup => pickup.serviceType === 'business').map(pickup => ({
          id: pickup._id,
          businessName: pickup.userName,
          contactPerson: 'N/A', // Placeholder, as not in model
          phone: pickup.userPhone,
          zone: 'Zone A', // Placeholder, as not in model
          wasteType: pickup.wasteType,
          estimatedWeight: pickup.weight,
          scheduledDate: pickup.date,
          status: pickup.status,
          assignedTo: pickup.driverId ? 'Assigned' : 'Unassigned', // Placeholder
          address: pickup.location
        }));
        setBusinessRequests(businessPickups);

        // Set collectors (workers)
        setCollectors(workersRes.data.map(worker => ({
          id: worker._id,
          name: worker.name,
          vehicle: worker.assignedVehicle || 'N/A',
          zone: 'Zone A', // Assuming zone is not in model, placeholder
          activePickups: 0, // Placeholder
          status: worker.status === 'active' ? 'available' : 'assigned'
        })));

        // Set payments (business pickups with payment info)
        const paymentsData = businessPickups.filter(pickup => pickup.paymentStatus !== 'pending' || pickup.finalAmount > 0).map(pickup => ({
          id: pickup._id,
          businessName: pickup.userName,
          amount: pickup.finalAmount || 0,
          method: 'Online', // Placeholder
          transactionId: pickup.paymentId || 'N/A',
          date: new Date(pickup.createdAt).toLocaleDateString(),
          status: pickup.paymentStatus === 'paid' ? 'received' : 'pending',
          proofUrl: 'proof.pdf' // Placeholder
        }));
        setPayments(paymentsData);

        // Donations remain hardcoded as no backend model
        setDonations([
          { id: 'DON001', businessName: 'Green Corp', amount: 5000, ngo: 'Eco Foundation', date: '2024-01-15', status: 'completed' },
          { id: 'DON002', businessName: 'Blue Industries', amount: 7500, ngo: 'Green Earth', date: '2024-01-20', status: 'completed' },
          { id: 'DON003', businessName: 'Tech Solutions', amount: 3000, ngo: 'Wildlife Trust', date: '2024-01-25', status: 'completed' },
          { id: 'DON004', businessName: 'Urban Waste', amount: 4500, ngo: 'Ocean Cleanup', date: '2024-02-01', status: 'completed' },
        ]);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data from backend');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const analytics = {
    totalRequests: businessRequests.length,
    pendingRequests: businessRequests.filter(r => r.status === 'pending').length,
    completedToday: businessRequests.filter(r => r.status === 'completed').length,
    totalWasteCollected: businessRequests.reduce((sum, r) => r.status === 'completed' ? sum + r.estimatedWeight : sum, 0),
    recyclingRatio: 75,
    totalRevenue: payments.filter(p => p.status === 'received').reduce((sum, p) => sum + p.amount, 0),
    totalDonations: donations.reduce((sum, d) => sum + d.amount, 0)
  };

  const assignCollector = async (requestId, collectorId) => {
    try {
      const collector = collectors.find(c => c.id === collectorId);
      // Make API call to assign pickup
      await axios.put(`/api/admin/pickups/${requestId}/assign`, {
        driverId: collectorId,
        status: 'assigned'
      });

      // Update local state after successful API call
      setBusinessRequests(businessRequests.map(req =>
        req.id === requestId
          ? { ...req, status: 'assigned', assignedTo: `Driver - ${collector.name}` }
          : req
      ));
      setCollectors(collectors.map(c =>
        c.id === collectorId
          ? { ...c, status: 'assigned', activePickups: c.activePickups + 1 }
          : c
      ));
      setShowModal(false);
      alert(`Request ${requestId} assigned to ${collector.name}`);
    } catch (error) {
      console.error('Error assigning collector:', error);
      alert('Failed to assign collector. Please try again.');
    }
  };

  const updateRequestStatus = (requestId, newStatus) => {
    setBusinessRequests(businessRequests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : req.completedDate
          }
        : req
    ));
  };

  const verifyPayment = (paymentId) => {
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'received', verifiedBy: 'Admin' }
        : p
    ));
    alert('Payment verified successfully!');
  };

  const exportReport = (type) => {
    alert(`Exporting ${type} report...`);
  };

  const OverviewDashboard = () => (
    <div>
      <h2 style={styles.pageTitle}>Analytics Overview</h2>
      
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderLeft: '4px solid #3b82f6'}}>
          <div style={styles.statIcon}><Package size={32} style={{color: '#3b82f6'}} /></div>
          <div>
            <div style={styles.statValue}>{analytics.totalRequests}</div>
            <div style={styles.statLabel}>Total Requests</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #f59e0b'}}>
          <div style={styles.statIcon}><ClipboardCheck size={32} style={{color: '#f59e0b'}} /></div>
          <div>
            <div style={styles.statValue}>{analytics.pendingRequests}</div>
            <div style={styles.statLabel}>Pending Requests</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #10b981'}}>
          <div style={styles.statIcon}><Leaf size={32} style={{color: '#10b981'}} /></div>
          <div>
            <div style={styles.statValue}>{analytics.totalWasteCollected} kg</div>
            <div style={styles.statLabel}>Waste Collected</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #8b5cf6'}}>
          <div style={styles.statIcon}><TrendingUp size={32} style={{color: '#8b5cf6'}} /></div>
          <div>
            <div style={styles.statValue}>{analytics.recyclingRatio}%</div>
            <div style={styles.statLabel}>Recycling Ratio</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #059669'}}>
          <div style={styles.statIcon}><DollarSign size={32} style={{color: '#059669'}} /></div>
          <div>
            <div style={styles.statValue}>₹{analytics.totalRevenue.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Revenue</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #ec4899'}}>
          <div style={styles.statIcon}><Heart size={32} style={{color: '#ec4899'}} /></div>
          <div>
            <div style={styles.statValue}>₹{analytics.totalDonations.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Donations</div>
          </div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Waste Collection by Zone</h3>
          <div style={styles.barChart}>
            <div style={styles.barGroup}>
              <div style={{...styles.bar, height: '80%', background: '#3b82f6'}}></div>
              <div style={styles.barLabel}>North</div>
            </div>
            <div style={styles.barGroup}>
              <div style={{...styles.bar, height: '95%', background: '#10b981'}}></div>
              <div style={styles.barLabel}>South</div>
            </div>
            <div style={styles.barGroup}>
              <div style={{...styles.bar, height: '60%', background: '#f59e0b'}}></div>
              <div style={styles.barLabel}>East</div>
            </div>
            <div style={styles.barGroup}>
              <div style={{...styles.bar, height: '70%', background: '#8b5cf6'}}></div>
              <div style={styles.barLabel}>West</div>
            </div>
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Waste Type Distribution</h3>
          <div style={styles.pieChart}>
            <div style={styles.pieItem}>
              <div style={{...styles.pieColor, background: '#10b981'}}></div>
              <span>Organic (45%)</span>
            </div>
            <div style={styles.pieItem}>
              <div style={{...styles.pieColor, background: '#3b82f6'}}></div>
              <span>E-Waste (25%)</span>
            </div>
            <div style={styles.pieItem}>
              <div style={{...styles.pieColor, background: '#f59e0b'}}></div>
              <span>Paper (20%)</span>
            </div>
            <div style={styles.pieItem}>
              <div style={{...styles.pieColor, background: '#8b5cf6'}}></div>
              <span>Plastic (10%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BusinessRequestsView = () => {
    const filteredRequests = businessRequests.filter(req => {
      const matchesSearch = req.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div>
        <div style={styles.viewHeader}>
          <h2 style={styles.pageTitle}>Business Pickup Requests</h2>
          <button style={styles.exportBtn} onClick={() => exportReport('requests')}>
            <Download size={18} />
            Export Report
          </button>
        </div>

        <div style={styles.filtersBar}>
          <div style={styles.searchBox}>
            <Search size={20} style={{color: '#718096'}} />
            <input 
              type="text"
              placeholder="Search by business name or ID..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            style={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
            <option value="verified">Verified</option>
          </select>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Request ID</th>
                <th style={styles.th}>Business Name</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Zone</th>
                <th style={styles.th}>Waste Type</th>
                <th style={styles.th}>Weight (kg)</th>
                <th style={styles.th}>Scheduled Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id} style={styles.tableRow}>
                  <td style={styles.td}>{req.id}</td>
                  <td style={styles.td}>
                    <div style={styles.businessCell}>
                      <div style={styles.businessName}>{req.businessName}</div>
                      <div style={styles.contactPerson}>{req.contactPerson}</div>
                    </div>
                  </td>
                  <td style={styles.td}>{req.phone}</td>
                  <td style={styles.td}>
                    <div style={styles.zoneTag}>{req.zone}</div>
                  </td>
                  <td style={styles.td}>{req.wasteType}</td>
                  <td style={styles.td}>{req.estimatedWeight}</td>
                  <td style={styles.td}>{req.scheduledDate}</td>
                  <td style={styles.td}>
                    <div style={{
                      ...styles.statusBadge,
                      background: req.status === 'pending' ? '#fef3c7' :
                                 req.status === 'assigned' ? '#dbeafe' :
                                 req.status === 'completed' ? '#d1fae5' : '#fce7f3',
                      color: req.status === 'pending' ? '#92400e' :
                             req.status === 'assigned' ? '#1e40af' :
                             req.status === 'completed' ? '#065f46' : '#9f1239'
                    }}>
                      {req.status}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.actionBtn}
                        onClick={() => {
                          setSelectedRequest(req);
                          setModalType('view');
                          setShowModal(true);
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {req.status === 'pending' && (
                        <button 
                          style={{...styles.actionBtn, background: '#3b82f6'}}
                          onClick={() => {
                            setSelectedRequest(req);
                            setModalType('assign');
                            setShowModal(true);
                          }}
                          title="Assign Collector"
                        >
                          <Truck size={16} />
                        </button>
                      )}
                      {req.status === 'assigned' && (
                        <button 
                          style={{...styles.actionBtn, background: '#10b981'}}
                          onClick={() => updateRequestStatus(req.id, 'completed')}
                          title="Mark Complete"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CollectorsView = () => (
    <div>
      <h2 style={styles.pageTitle}>Collector Management</h2>
      
      <div style={styles.collectorsGrid}>
        {collectors.map(collector => (
          <div key={collector.id} style={styles.collectorCard}>
            <div style={styles.collectorHeader}>
              <div style={styles.collectorAvatar}>
                {collector.name.charAt(0)}
              </div>
              <div>
                <div style={styles.collectorName}>{collector.name}</div>
                <div style={styles.collectorVehicle}>
                  <Truck size={14} style={{marginRight: '4px'}} />
                  {collector.vehicle}
                </div>
              </div>
            </div>
            
            <div style={styles.collectorDetails}>
              <div style={styles.detailRow}>
                <MapPin size={16} style={{color: '#718096'}} />
                <span>Zone: {collector.zone}</span>
              </div>
              <div style={styles.detailRow}>
                <Package size={16} style={{color: '#718096'}} />
                <span>Active Pickups: {collector.activePickups}</span>
              </div>
            </div>
            
            <div style={{
              ...styles.collectorStatus,
              background: collector.status === 'available' ? '#d1fae5' : '#fef3c7',
              color: collector.status === 'available' ? '#065f46' : '#92400e'
            }}>
              {collector.status === 'available' ? 'Available' : 'Assigned'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PaymentsView = () => (
    <div>
      <div style={styles.viewHeader}>
        <h2 style={styles.pageTitle}>Payment Collections</h2>
        <button style={styles.exportBtn} onClick={() => exportReport('payments')}>
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Payment ID</th>
              <th style={styles.th}>Business Name</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Method</th>
              <th style={styles.th}>Transaction ID</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} style={styles.tableRow}>
                <td style={styles.td}>{payment.id}</td>
                <td style={styles.td}>{payment.businessName}</td>
                <td style={styles.td}>
                  <div style={styles.amountCell}>₹{(payment.amount || 0).toLocaleString()}</div>
                </td>
                <td style={styles.td}>{payment.method}</td>
                <td style={styles.td}>
                  <code style={styles.transactionId}>{payment.transactionId}</code>
                </td>
                <td style={styles.td}>{payment.date}</td>
                <td style={styles.td}>
                  <div style={{
                    ...styles.statusBadge,
                    background: payment.status === 'received' ? '#d1fae5' : '#fef3c7',
                    color: payment.status === 'received' ? '#065f46' : '#92400e'
                  }}>
                    {payment.status}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button 
                      style={styles.actionBtn}
                      onClick={() => {
                        setSelectedRequest(payment);
                        setModalType('payment');
                        setShowModal(true);
                      }}
                      title="View Proof"
                    >
                      <Eye size={16} />
                    </button>
                    {payment.status === 'pending' && (
                      <button 
                        style={{...styles.actionBtn, background: '#10b981'}}
                        onClick={() => verifyPayment(payment.id)}
                        title="Verify Payment"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const RewardsDonationsView = () => (
    <div>
      <h2 style={styles.pageTitle}>Rewards & Donations Management</h2>
      
      <div style={styles.rewardsGrid}>
        <div style={styles.rewardCard}>
          <div style={styles.rewardHeader}>
            <Award size={32} style={{color: '#f59e0b'}} />
            <h3 style={styles.rewardTitle}>Business Rewards Program</h3>
          </div>
          <div style={styles.rewardStats}>
            <div style={styles.rewardStat}>
              <div style={styles.rewardStatValue}>1,250</div>
              <div style={styles.rewardStatLabel}>Active Businesses</div>
            </div>
            <div style={styles.rewardStat}>
              <div style={styles.rewardStatValue}>₹2.5L</div>
              <div style={styles.rewardStatLabel}>Discounts Given</div>
            </div>
          </div>
        </div>

        <div style={styles.rewardCard}>
          <div style={styles.rewardHeader}>
            <Heart size={32} style={{color: '#ec4899'}} />
            <h3 style={styles.rewardTitle}>NGO Donations</h3>
          </div>
          <div style={styles.rewardStats}>
            <div style={styles.rewardStat}>
              <div style={styles.rewardStatValue}>{donations.length}</div>
              <div style={styles.rewardStatLabel}>Total Donations</div>
            </div>
            <div style={styles.rewardStat}>
              <div style={styles.rewardStatValue}>₹{analytics.totalDonations.toLocaleString()}</div>
              <div style={styles.rewardStatLabel}>Amount Donated</div>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{...styles.pageTitle, fontSize: '1.25rem', marginTop: '30px'}}>Recent Donations</h3>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Donation ID</th>
              <th style={styles.th}>Business Name</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>NGO Partner</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(donation => (
              <tr key={donation.id} style={styles.tableRow}>
                <td style={styles.td}>{donation.id}</td>
                <td style={styles.td}>{donation.businessName}</td>
                <td style={styles.td}>
                  <div style={styles.amountCell}>₹{donation.amount.toLocaleString()}</div>
                </td>
                <td style={styles.td}>{donation.ngo}</td>
                <td style={styles.td}>{donation.date}</td>
                <td style={styles.td}>
                  <div style={{
                    ...styles.statusBadge,
                    background: '#d1fae5',
                    color: '#065f46'
                  }}>
                    {donation.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ViewDetailsModal = () => (
    <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Request Details</h2>
        <div style={styles.modalContent}>
          <div style={styles.detailGrid}>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Request ID</div>
              <div style={styles.detailValue}>{selectedRequest?.id}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Business Name</div>
              <div style={styles.detailValue}>{selectedRequest?.businessName}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Contact Person</div>
              <div style={styles.detailValue}>{selectedRequest?.contactPerson}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Phone</div>
              <div style={styles.detailValue}>{selectedRequest?.phone}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Address</div>
              <div style={styles.detailValue}>{selectedRequest?.address}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Zone</div>
              <div style={styles.detailValue}>{selectedRequest?.zone}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Waste Type</div>
              <div style={styles.detailValue}>{selectedRequest?.wasteType}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Estimated Weight</div>
              <div style={styles.detailValue}>{selectedRequest?.estimatedWeight} kg</div>
            </div>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={() => setShowModal(false)}>Close</button>
      </div>
    </div>
  );

  const AssignCollectorModal = () => (
    <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Assign Collector</h2>
        <p style={styles.modalSubtitle}>Request: {selectedRequest?.id} - {selectedRequest?.businessName}</p>
        
        <div style={styles.collectorsList}>
          {collectors.filter(c => c.status === 'available' || c.activePickups < 3).map(collector => (
            <div 
              key={collector.id}
              style={styles.collectorSelectCard}
              onClick={() => assignCollector(selectedRequest?.id, collector.id)}
            >
              <div style={styles.collectorInfo}>
                <div style={styles.collectorAvatar}>{collector.name.charAt(0)}</div>
                <div>
                  <div style={styles.collectorName}>{collector.name}</div>
                  <div style={styles.collectorVehicle}>{collector.vehicle}</div>
                </div>
              </div>
              <div style={styles.collectorMeta}>
                <div style={styles.metaItem}>Zone: {collector.zone}</div>
                <div style={styles.metaItem}>Active: {collector.activePickups}</div>
              </div>
            </div>
          ))}
        </div>
        
        <button style={styles.closeBtn} onClick={() => setShowModal(false)}>Cancel</button>
      </div>
    </div>
  );

  const PaymentProofModal = () => (
    <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Payment Proof</h2>
        <div style={styles.modalContent}>
          <div style={styles.paymentProofDetails}>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Payment ID</div>
              <div style={styles.detailValue}>{selectedRequest?.id}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Business Name</div>
              <div style={styles.detailValue}>{selectedRequest?.businessName}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Amount</div>
              <div style={styles.detailValue}>₹{selectedRequest?.amount?.toLocaleString()}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Transaction ID</div>
              <div style={styles.detailValue}>
                <code style={styles.transactionId}>{selectedRequest?.transactionId}</code>
              </div>
            </div>
          </div>
          
          <div style={styles.proofContainer}>
            <div style={styles.proofLabel}>Payment Proof Document:</div>
            <div style={styles.proofPlaceholder}>
              <FileText size={48} style={{color: '#cbd5e1'}} />
              <div style={styles.proofFilename}>{selectedRequest?.proofUrl}</div>
              <button style={styles.downloadProofBtn}>
                <Download size={16} />
                Download Proof
              </button>
            </div>
          </div>
        </div>
        
        <div style={styles.modalButtons}>
          <button style={styles.closeBtn} onClick={() => setShowModal(false)}>Close</button>
          {selectedRequest?.status === 'pending' && (
            <button 
              style={styles.verifyBtn} 
              onClick={() => {
                verifyPayment(selectedRequest?.id);
                setShowModal(false);
              }}
            >
              <Check size={18} />
              Verify Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <Users size={32} style={{color: '#10b981'}} />
          <h2 style={styles.sidebarTitle}>Admin Panel</h2>
        </div>
        
        <nav style={styles.nav}>
          <button 
            style={{...styles.navItem, ...(activeView === 'overview' && styles.navItemActive)}}
            onClick={() => setActiveView('overview')}
          >
            <BarChart2 size={20} />
            <span>Analytics Overview</span>
          </button>
          
          <button 
            style={{...styles.navItem, ...(activeView === 'requests' && styles.navItemActive)}}
            onClick={() => setActiveView('requests')}
          >
            <ClipboardCheck size={20} />
            <span>Business Requests</span>
            {analytics.pendingRequests > 0 && (
              <span style={styles.badge}>{analytics.pendingRequests}</span>
            )}
          </button>
          
          <button 
            style={{...styles.navItem, ...(activeView === 'collectors' && styles.navItemActive)}}
            onClick={() => setActiveView('collectors')}
          >
            <Truck size={20} />
            <span>Collectors</span>
          </button>
          
          <button 
            style={{...styles.navItem, ...(activeView === 'payments' && styles.navItemActive)}}
            onClick={() => setActiveView('payments')}
          >
            <DollarSign size={20} />
            <span>Payments</span>
          </button>
          
          <button 
            style={{...styles.navItem, ...(activeView === 'rewards' && styles.navItemActive)}}
            onClick={() => setActiveView('rewards')}
          >
            <Award size={20} />
            <span>Rewards & Donations</span>
          </button>
          
          <button 
            style={{...styles.navItem, ...(activeView === 'reports' && styles.navItemActive)}}
            onClick={() => setActiveView('reports')}
          >
            <FileText size={20} />
            <span>Generate Reports</span>
          </button>
        </nav>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.topBarTitle}>Waste Management Admin</h1>
            <p style={styles.topBarSubtitle}>Monitor and manage business waste operations</p>
          </div>
          <button style={styles.logoutBtn}>Logout</button>
        </div>

        <div style={styles.contentArea}>
          {activeView === 'overview' && <OverviewDashboard />}
          {activeView === 'requests' && <BusinessRequestsView />}
          {activeView === 'collectors' && <CollectorsView />}
          {activeView === 'payments' && <PaymentsView />}
          {activeView === 'rewards' && <RewardsDonationsView />}
          {activeView === 'reports' && (
            <div>
              <h2 style={styles.pageTitle}>Generate Reports</h2>
              <div style={styles.reportsGrid}>
                <button style={styles.reportCard} onClick={() => exportReport('monthly-zone')}>
                  <FileText size={32} style={{color: '#3b82f6'}} />
                  <div style={styles.reportTitle}>Monthly Report by Zone</div>
                  <div style={styles.reportDesc}>Generate zone-wise waste collection report</div>
                </button>
                
                <button style={styles.reportCard} onClick={() => exportReport('waste-type')}>
                  <FileText size={32} style={{color: '#10b981'}} />
                  <div style={styles.reportTitle}>Waste Type Analysis</div>
                  <div style={styles.reportDesc}>Detailed breakdown by waste categories</div>
                </button>
                
                <button style={styles.reportCard} onClick={() => exportReport('business-category')}>
                  <FileText size={32} style={{color: '#f59e0b'}} />
                  <div style={styles.reportTitle}>Business Category Report</div>
                  <div style={styles.reportDesc}>Analysis by business type and size</div>
                </button>
                
                <button style={styles.reportCard} onClick={() => exportReport('revenue')}>
                  <FileText size={32} style={{color: '#8b5cf6'}} />
                  <div style={styles.reportTitle}>Revenue Report</div>
                  <div style={styles.reportDesc}>Financial summary and payment tracking</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && modalType === 'view' && <ViewDetailsModal />}
      {showModal && modalType === 'assign' && <AssignCollectorModal />}
      {showModal && modalType === 'payment' && <PaymentProofModal />}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Segoe UI', sans-serif",
  },
  sidebar: {
    width: '280px',
    background: '#003D5C',
    color: 'white',
    padding: '30px 20px',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
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
    position: 'relative',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
  },
  badge: {
    position: 'absolute',
    right: '12px',
    background: '#ef4444',
    color: 'white',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    background: 'white',
    padding: '30px 40px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0,
  },
  topBarSubtitle: {
    fontSize: '1rem',
    color: '#718096',
    marginTop: '4px',
  },
  logoutBtn: {
    padding: '12px 24px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  contentArea: {
    padding: '40px',
    overflow: 'auto',
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    background: '#f7fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a202c',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#718096',
    marginTop: '4px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  chartTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '20px',
  },
  barChart: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '200px',
    gap: '20px',
  },
  barGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: '100%',
    borderRadius: '8px 8px 0 0',
  },
  barLabel: {
    marginTop: '8px',
    fontSize: '0.875rem',
    color: '#718096',
    fontWeight: '600',
  },
  pieChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  pieItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1rem',
    color: '#4a5568',
  },
  pieColor: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
  },
  viewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  exportBtn: {
    padding: '12px 20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },
  filtersBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
  },
  filterSelect: {
    padding: '12px 16px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    outline: 'none',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: '#f7fafc',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4a5568',
    borderBottom: '2px solid #e2e8f0',
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '16px',
    fontSize: '0.875rem',
    color: '#1a202c',
  },
  businessCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  businessName: {
    fontWeight: '600',
    color: '#1a202c',
  },
  contactPerson: {
    fontSize: '0.75rem',
    color: '#718096',
  },
  zoneTag: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#e0e7ff',
    color: '#3730a3',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '8px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  collectorCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  collectorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  collectorAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#003D5C',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  collectorName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1a202c',
  },
  collectorVehicle: {
    fontSize: '0.875rem',
    color: '#718096',
    display: 'flex',
    alignItems: 'center',
    marginTop: '4px',
  },
  collectorDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    color: '#4a5568',
  },
  collectorStatus: {
    padding: '8px',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amountCell: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#059669',
  },
  transactionId: {
    background: '#f7fafc',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
  },
  rewardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '30px',
  },
  rewardCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  rewardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  rewardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a202c',
  },
  rewardStats: {
    display: 'flex',
    gap: '24px',
  },
  rewardStat: {
    flex: 1,
  },
  rewardStatValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a202c',
  },
  rewardStatLabel: {
    fontSize: '0.875rem',
    color: '#718096',
    marginTop: '4px',
  },
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  reportCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  reportTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1a202c',
    marginTop: '16px',
  },
  reportDesc: {
    fontSize: '0.875rem',
    color: '#718096',
    marginTop: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '8px',
  },
  modalSubtitle: {
    fontSize: '1rem',
    color: '#718096',
    marginBottom: '24px',
  },
  modalContent: {
    marginBottom: '24px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: '1rem',
    color: '#1a202c',
  },
  collectorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  collectorSelectCard: {
    padding: '16px',
    background: '#f7fafc',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid transparent',
  },
  collectorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  collectorMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.875rem',
    color: '#718096',
  },
  metaItem: {
    fontSize: '0.875rem',
  },
  paymentProofDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  proofContainer: {
    marginTop: '24px',
  },
  proofLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '12px',
  },
  proofPlaceholder: {
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    background: '#f7fafc',
  },
  proofFilename: {
    fontSize: '0.875rem',
    color: '#718096',
    marginTop: '12px',
    marginBottom: '16px',
  },
  downloadProofBtn: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
  },
  closeBtn: {
    flex: 1,
    padding: '12px',
    background: '#e2e8f0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  verifyBtn: {
    flex: 1,
    padding: '12px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
};

export default AdminBusinessDashboard;