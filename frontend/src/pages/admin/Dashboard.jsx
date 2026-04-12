import API_URL from '../../api.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';

const API = `${API_URL}/api`;

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'picked_up': return '#3b82f6';
    case 'in_transit': return '#8b5cf6';
    case 'delivered': return '#10b981';
    default: return '#6b7280';
  }
};

const StatusBadge = ({ status }) => (
  <span style={{ background: getStatusColor(status), color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
    {status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
  </span>
);

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [damageClaims, setDamageClaims] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Loading states
  const [, setLoadingStats] = useState(false);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [updating, setUpdating] = useState(null);

  // Search/filter
  const [deliverySearch, setDeliverySearch] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all');

  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchStats();
    fetchDeliveries();
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) fetchUsers();
    if (activeTab === 'drivers' && drivers.length === 0) fetchDrivers();
    if (activeTab === 'complaints' && complaints.length === 0) { fetchComplaints(); fetchRefundRequests(); }
    if (activeTab === 'damage' && damageClaims.length === 0) fetchDamageClaims();
    if (activeTab === 'analytics' && !analytics) fetchAnalytics();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get(`${API}/admin/dashboard`, { headers: authHeader });
      setDashboardStats(res.data);
    } catch (err) {
      console.error('fetchStats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchDeliveries = async () => {
    setLoadingDeliveries(true);
    try {
      const res = await axios.get(`${API}/deliveries/all`, { headers: authHeader });
      setDeliveries(res.data.deliveries || []);
    } catch (err) {
      console.error('fetchDeliveries:', err);
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API}/admin/users`, { headers: authHeader });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('fetchUsers:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const res = await axios.get(`${API}/admin/drivers`, { headers: authHeader });
      setDrivers(res.data.drivers || []);
    } catch (err) {
      console.error('fetchDrivers:', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const res = await axios.get(`${API}/complaints/all`, { headers: authHeader });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('fetchComplaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const fetchRefundRequests = async () => {
    try {
      const res = await axios.get(`${API}/complaints/refund-requests`, { headers: authHeader });
      setRefundRequests(res.data.refund_requests || []);
    } catch (err) {
      console.error('Failed to load refund requests');
    }
  };

  const handleRefundDecision = async (id, status, notes = '') => {
    try {
      await axios.put(`${API}/complaints/refund-requests/${id}`,
        { status, admin_notes: notes },
        { headers: authHeader }
      );
      fetchRefundRequests();
    } catch (err) {
      alert('Failed to update refund request');
    }
  };

  const fetchDamageClaims = async () => {
    setLoadingClaims(true);
    try {
      const res = await axios.get(`${API}/damage-claims/all`, { headers: authHeader });
      setDamageClaims(res.data.claims || []);
    } catch (err) {
      console.error('fetchDamageClaims:', err);
    } finally {
      setLoadingClaims(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await axios.get(`${API}/admin/analytics`, { headers: authHeader });
      setAnalytics(res.data);
    } catch (err) {
      console.error('fetchAnalytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const updateDeliveryStatus = async (id, status, driver_id) => {
    setUpdating(id + '-status');
    try {
      await axios.put(`${API}/deliveries/${id}/status`, { status, driver_id }, { headers: authHeader });
      fetchDeliveries();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const updateComplaintStatus = async (id, status) => {
    setUpdating('complaint-' + id);
    try {
      await axios.put(`${API}/complaints/${id}/status`, { status }, { headers: authHeader });
      fetchComplaints();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const handleClaimDecision = async (id, decision) => {
    setUpdating('claim-' + id);
    try {
      await axios.put(`${API}/damage-claims/${id}/decision`, { decision }, { headers: authHeader });
      fetchDamageClaims();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchSearch = !deliverySearch ||
      String(d.id).includes(deliverySearch) ||
      (d.sender_name || '').toLowerCase().includes(deliverySearch.toLowerCase()) ||
      (d.receiver_name || '').toLowerCase().includes(deliverySearch.toLowerCase()) ||
      (d.pickup_address || '').toLowerCase().includes(deliverySearch.toLowerCase()) ||
      (d.delivery_address || '').toLowerCase().includes(deliverySearch.toLowerCase());
    const matchStatus = deliveryStatusFilter === 'all' || d.status === deliveryStatusFilter;
    return matchSearch && matchStatus;
  });

  const stats = dashboardStats?.stats || dashboardStats || {};
  const recentDeliveries = dashboardStats?.recent_deliveries || deliveries.slice(0, 5);

  const TABS = [
    { key: 'overview',   label: `📊 ${t('dashboard.admin.tabs.overview')}` },
    { key: 'deliveries', label: `📦 ${t('dashboard.admin.tabs.deliveries')}` },
    { key: 'users',      label: `👥 ${t('dashboard.admin.tabs.users')}` },
    { key: 'drivers',    label: `🚗 ${t('dashboard.admin.tabs.drivers')}` },
    { key: 'complaints', label: `📣 ${t('dashboard.admin.tabs.complaints')}` },
    { key: 'damage',     label: `📸 ${t('dashboard.admin.tabs.damage')}` },
    { key: 'analytics',  label: `📈 ${t('dashboard.admin.tabs.analytics')}` },
  ];

  const cardStyle = { background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' };
  const thStyle = { padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px', borderBottom: '2px solid #f1f5f9' };
  const tdStyle = { padding: '12px', fontSize: '13px', borderBottom: '1px solid #f8fafc', color: '#1e293b' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '96px 20px 40px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', borderRadius: '16px', padding: '28px 32px', marginBottom: '28px', color: 'white' }}>
          <BackButton />
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px' }}>
            🛠 {t('dashboard.admin.title')}
          </h1>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>{t('dashboard.admin.subtitle', { name: user?.name })}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px', background: 'white', borderRadius: '12px', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? '#dc2626' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#64748b',
                border: 'none', borderRadius: '8px', padding: '9px 16px',
                fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: t('dashboard.admin.stats.totalDeliveries'), value: stats.total_deliveries ?? deliveries.length, color: '#dc2626', icon: '📦' },
                { label: t('dashboard.admin.stats.pending'), value: stats.pending ?? deliveries.filter(d => d.status === 'pending').length, color: '#f59e0b', icon: '⏳' },
                { label: t('dashboard.admin.stats.inTransit'), value: stats.in_transit ?? deliveries.filter(d => d.status === 'in_transit').length, color: '#8b5cf6', icon: '🚚' },
                { label: t('dashboard.admin.stats.delivered'), value: stats.delivered ?? deliveries.filter(d => d.status === 'delivered').length, color: '#10b981', icon: '✅' },
                { label: t('dashboard.admin.stats.totalUsers'), value: stats.total_users ?? users.length, color: '#2563eb', icon: '👥' },
                { label: t('dashboard.admin.stats.drivers'), value: stats.total_drivers ?? drivers.length, color: '#0891b2', icon: '🚗' },
                { label: t('dashboard.admin.stats.revenue'), value: stats.total_revenue ? `€${Number(stats.total_revenue).toFixed(0)}` : '—', color: '#16a34a', icon: '💰' },
                { label: t('dashboard.admin.stats.openComplaints'), value: stats.open_complaints ?? complaints.filter(c => c.status === 'open').length, color: '#ef4444', icon: '📣' },
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>{s.icon}</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', color: s.color }}>{s.value ?? 0}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent deliveries */}
            <div style={cardStyle}>
              <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px', marginBottom: '16px' }}>
                📋 {t('dashboard.admin.recentDeliveries')}
              </h2>
              {loadingDeliveries ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.loading')}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['#', t('dashboard.admin.table.sender'), t('dashboard.admin.table.receiver'), t('dashboard.admin.table.status'), t('dashboard.admin.table.date')].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentDeliveries.slice(0, 8).map(d => (
                        <tr key={d.id}>
                          <td style={tdStyle}><strong>#{d.id}</strong></td>
                          <td style={tdStyle}>{d.sender_name || d.user_name}</td>
                          <td style={tdStyle}>{d.receiver_name}</td>
                          <td style={tdStyle}><StatusBadge status={d.status} /></td>
                          <td style={tdStyle}>{new Date(d.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DELIVERIES TAB ── */}
        {activeTab === 'deliveries' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px', margin: 0 }}>
                📦 {t('dashboard.admin.allDeliveries')} ({filteredDeliveries.length})
              </h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder={t('dashboard.admin.search')}
                  value={deliverySearch}
                  onChange={e => setDeliverySearch(e.target.value)}
                  style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', outline: 'none', width: '200px' }}
                />
                <select
                  value={deliveryStatusFilter}
                  onChange={e => setDeliveryStatusFilter(e.target.value)}
                  style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="all">{t('dashboard.admin.allStatuses')}</option>
                  <option value="pending">{t('dashboard.admin.statusOptions.pending')}</option>
                  <option value="picked_up">{t('dashboard.admin.statusOptions.pickedUp')}</option>
                  <option value="in_transit">{t('dashboard.admin.statusOptions.inTransit')}</option>
                  <option value="delivered">{t('dashboard.admin.statusOptions.delivered')}</option>
                </select>
                <button
                  onClick={fetchDeliveries}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  🔄 {t('dashboard.admin.refresh')}
                </button>
              </div>
            </div>

            {loadingDeliveries ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.loadingDeliveries')}</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      {['#', t('dashboard.admin.table.user'), t('dashboard.admin.table.receiver'), t('dashboard.admin.table.pickup'), t('dashboard.admin.table.delivery'), t('dashboard.admin.table.driver'), t('dashboard.admin.table.status'), t('dashboard.admin.table.actions')].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveries.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ ...tdStyle, fontWeight: '700' }}>#{d.id}</td>
                        <td style={tdStyle}>{d.user_name || d.sender_name}</td>
                        <td style={tdStyle}>{d.receiver_name}</td>
                        <td style={{ ...tdStyle, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }}>{d.pickup_address}</td>
                        <td style={{ ...tdStyle, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }}>{d.delivery_address}</td>
                        <td style={tdStyle}>
                          <select
                            value={d.driver_id || ''}
                            onChange={e => updateDeliveryStatus(d.id, d.status, e.target.value || null)}
                            disabled={updating === d.id + '-status'}
                            style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 8px', fontSize: '12px', cursor: 'pointer', minWidth: '120px' }}
                          >
                            <option value="">{t('dashboard.admin.unassigned')}</option>
                            {drivers.map(dr => (
                              <option key={dr.id} value={dr.id}>{dr.name}</option>
                            ))}
                          </select>
                        </td>
                        <td style={tdStyle}><StatusBadge status={d.status} /></td>
                        <td style={tdStyle}>
                          <select
                            value={d.status}
                            onChange={e => updateDeliveryStatus(d.id, e.target.value, d.driver_id)}
                            disabled={updating === d.id + '-status'}
                            style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 8px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            <option value="pending">{t('dashboard.admin.statusOptions.pending')}</option>
                            <option value="picked_up">{t('dashboard.admin.statusOptions.pickedUp')}</option>
                            <option value="in_transit">{t('dashboard.admin.statusOptions.inTransit')}</option>
                            <option value="delivered">{t('dashboard.admin.statusOptions.delivered')}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px', margin: 0 }}>
                👥 {t('dashboard.admin.allUsers')} ({users.length})
              </h2>
              <button onClick={fetchUsers} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                🔄 {t('dashboard.admin.refresh')}
              </button>
            </div>
            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.loadingUsers')}</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      {['#', t('dashboard.admin.table.name'), t('dashboard.admin.table.email'), t('dashboard.admin.table.role'), t('dashboard.admin.table.deliveries'), t('dashboard.admin.table.joined')].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={{ ...tdStyle, fontWeight: '700' }}>#{u.id}</td>
                        <td style={tdStyle}>{u.name}</td>
                        <td style={tdStyle}>{u.email}</td>
                        <td style={tdStyle}>
                          <span style={{
                            background: u.role === 'admin' ? '#fee2e2' : u.role === 'driver' ? '#dbeafe' : '#dcfce7',
                            color: u.role === 'admin' ? '#dc2626' : u.role === 'driver' ? '#2563eb' : '#16a34a',
                            padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={tdStyle}>{u.delivery_count ?? '—'}</td>
                        <td style={tdStyle}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── DRIVERS TAB ── */}
        {activeTab === 'drivers' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px', margin: 0 }}>
                🚗 {t('dashboard.admin.driverPerformance')} ({drivers.length})
              </h2>
              <button onClick={fetchDrivers} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                🔄 {t('dashboard.admin.refresh')}
              </button>
            </div>
            {loadingDrivers ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.loadingDrivers')}</div>
            ) : drivers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.noDrivers')}</div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {drivers.map(d => (
                  <div key={d.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>🚗 {d.name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{d.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      {[
                        { label: t('dashboard.admin.assigned'), value: d.assigned_count ?? d.deliveries_assigned ?? '—', color: '#2563eb' },
                        { label: t('dashboard.admin.stats.delivered'), value: d.delivered_count ?? d.deliveries_delivered ?? '—', color: '#16a34a' },
                        { label: t('dashboard.admin.stats.inTransit'), value: d.in_transit_count ?? '—', color: '#8b5cf6' },
                        { label: t('dashboard.admin.rating'), value: d.rating ? `${d.rating}⭐` : '—', color: '#f59e0b' },
                      ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 'bold', color: s.color, fontSize: '20px' }}>{s.value}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMPLAINTS TAB ── */}
        {activeTab === 'complaints' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px', margin: 0 }}>
                📣 {t('dashboard.admin.allComplaints')} ({complaints.length})
              </h2>
              <button onClick={fetchComplaints} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                🔄 {t('dashboard.admin.refresh')}
              </button>
            </div>
            {/* Refund Invoices from Claude AI */}
            {refundRequests.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                  💰 {t('dashboard.admin.refundInvoices')} ({refundRequests.filter(r => r.status === 'pending').length})
                </h3>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {refundRequests.map(rr => {
                    let analysis = null;
                    try { if (rr.claude_analysis) analysis = JSON.parse(rr.claude_analysis); } catch {}
                    return (
                      <div key={rr.id} style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: rr.status === 'pending' ? '2px solid #fde68a' : rr.status === 'approved' ? '2px solid #86efac' : '2px solid #fca5a5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>
                              Invoice #{rr.id} — {rr.user_name} ({rr.user_email})
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                              Complaint #{rr.complaint_id} · {rr.complaint_type?.replace('_', ' ')} · {new Date(rr.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>€{parseFloat(rr.amount).toFixed(2)}</span>
                            <span style={{
                              padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                              background: rr.status === 'pending' ? '#fef3c7' : rr.status === 'approved' ? '#dcfce7' : '#fee2e2',
                              color: rr.status === 'pending' ? '#d97706' : rr.status === 'approved' ? '#16a34a' : '#dc2626'
                            }}>
                              {rr.status === 'pending' ? '⏳ Pending' : rr.status === 'approved' ? '✅ Approved' : '❌ Declined'}
                            </span>
                          </div>
                        </div>

                        {analysis?.summary && (
                          <div style={{ background: '#f0f9ff', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                            <div style={{ fontWeight: '600', color: '#0369a1', fontSize: '12px', marginBottom: '4px' }}>🤖 {t('dashboard.admin.aiAssessment')}</div>
                            <p style={{ color: '#0c4a6e', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{analysis.summary}</p>
                            {analysis.reason && <p style={{ color: '#0369a1', fontSize: '12px', margin: '6px 0 0', lineHeight: '1.4', fontStyle: 'italic' }}>{analysis.reason}</p>}
                          </div>
                        )}

                        {rr.image_paths && (
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                            📷 {JSON.parse(rr.image_paths).length} {t('dashboard.admin.evidencePhotos')}
                          </div>
                        )}

                        {rr.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                            <button
                              onClick={() => handleRefundDecision(rr.id, 'approved', 'Refund approved by admin')}
                              style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                              ✅ {t('dashboard.admin.approveRefund')} €{parseFloat(rr.amount).toFixed(2)}
                            </button>
                            <button
                              onClick={() => handleRefundDecision(rr.id, 'declined', 'Refund declined by admin')}
                              style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                              ❌ {t('dashboard.admin.declineRefund')}
                            </button>
                          </div>
                        )}

                        {rr.admin_notes && rr.status !== 'pending' && (
                          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>{t('dashboard.admin.adminNote')} {rr.admin_notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {loadingComplaints ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.loadingComplaints')}</div>
            ) : complaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.noComplaints')}</div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {complaints.map(c => (
                  <div key={c.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>
                          Complaint #{c.id} — {c.type?.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          By: {c.user_name || c.user_id} {c.delivery_id ? `· Delivery #${c.delivery_id}` : ''} · {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={c.status}
                          onChange={e => updateComplaintStatus(c.id, e.target.value)}
                          disabled={updating === 'complaint-' + c.id}
                          style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <option value="open">{t('dashboard.admin.complaintStatus.open')}</option>
                          <option value="in_review">{t('dashboard.admin.complaintStatus.inReview')}</option>
                          <option value="resolved">{t('dashboard.admin.complaintStatus.resolved')}</option>
                          <option value="closed">{t('dashboard.admin.complaintStatus.closed')}</option>
                        </select>
                      </div>
                    </div>
                    <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{c.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DAMAGE CLAIMS TAB ── */}
        {activeTab === 'damage' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px', margin: 0 }}>
                📸 {t('dashboard.admin.damageClaims')} ({damageClaims.length})
              </h2>
              <button onClick={fetchDamageClaims} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                🔄 {t('dashboard.admin.refresh')}
              </button>
            </div>
            {loadingClaims ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.loadingClaims')}</div>
            ) : damageClaims.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.noClaims')}</div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {damageClaims.map(claim => {
                  const verdictStyles = {
                    delivery_fault: { bg: '#fee2e2', color: '#dc2626', label: t('dashboard.admin.verdicts.deliveryFault') },
                    product_defect: { bg: '#fef3c7', color: '#d97706', label: t('dashboard.admin.verdicts.productDefect') },
                    unclear: { bg: '#f1f5f9', color: '#64748b', label: t('dashboard.admin.verdicts.unclear') },
                  };
                  const vs = verdictStyles[claim.ai_verdict] || verdictStyles.unclear;
                  return (
                    <div key={claim.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>
                            Claim #{claim.id} · Delivery #{claim.delivery_id}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                            By: {claim.user_name || claim.user_id} · {new Date(claim.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {claim.ai_verdict && (
                            <span style={{ background: vs.bg, color: vs.color, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                              🤖 {vs.label}
                            </span>
                          )}
                          {claim.estimated_refund_percent !== undefined && (
                            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                              {claim.estimated_refund_percent}% refund
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}>{claim.description}</p>

                      {claim.ai_analysis && (
                        <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '13px', color: '#1d4ed8' }}>
                          🤖 <strong>{t('dashboard.admin.aiAnalysis')}:</strong> {claim.ai_analysis}
                        </div>
                      )}

                      {claim.status === 'pending' || claim.status === 'under_review' ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleClaimDecision(claim.id, 'approved')}
                            disabled={updating === 'claim-' + claim.id}
                            style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                          >
                            ✅ {t('dashboard.admin.approve')}
                          </button>
                          <button
                            onClick={() => handleClaimDecision(claim.id, 'declined')}
                            disabled={updating === 'claim-' + claim.id}
                            style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                          >
                            ❌ {t('dashboard.admin.decline')}
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', fontWeight: '600', color: claim.status === 'approved' ? '#16a34a' : '#dc2626' }}>
                          {t('dashboard.admin.decision')} {claim.status?.replace(/\b\w/g, c => c.toUpperCase())}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div>
            {loadingAnalytics ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                {t('dashboard.admin.loadingAnalytics')}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Monthly deliveries bar chart */}
                <div style={cardStyle}>
                  <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px', marginBottom: '20px' }}>
                    📈 {t('dashboard.admin.monthlyDeliveries')}
                  </h2>
                  {analytics?.monthly_deliveries && analytics.monthly_deliveries.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '0 10px' }}>
                      {analytics.monthly_deliveries.map((item, i) => {
                        const maxVal = Math.max(...analytics.monthly_deliveries.map(m => m.count || 0));
                        const barHeight = maxVal > 0 ? Math.max(8, ((item.count || 0) / maxVal) * 170) : 8;
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}>{item.count || 0}</div>
                            <div style={{ width: '100%', height: `${barHeight}px`, background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)', borderRadius: '6px 6px 0 0', transition: 'height 0.3s' }} />
                            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.2' }}>
                              {item.month || item.label || `M${i + 1}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('dashboard.admin.noAnalytics')}</div>
                  )}
                </div>

                {/* Status distribution */}
                {analytics?.status_distribution && (
                  <div style={cardStyle}>
                    <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px', marginBottom: '16px' }}>
                      📊 {t('dashboard.admin.statusDistribution')}
                    </h2>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {analytics.status_distribution.map((item, i) => {
                        const total = analytics.status_distribution.reduce((s, d) => s + (d.count || 0), 0);
                        const pct = total > 0 ? Math.round(((item.count || 0) / total) * 100) : 0;
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                              <span style={{ color: '#374151', fontWeight: '600' }}>{item.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                              <span style={{ color: '#64748b' }}>{item.count} ({pct}%)</span>
                            </div>
                            <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: getStatusColor(item.status), width: `${pct}%`, borderRadius: '10px', transition: 'width 0.5s' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Revenue stats */}
                {analytics?.revenue && (
                  <div style={cardStyle}>
                    <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px', marginBottom: '16px' }}>
                      💰 {t('dashboard.admin.revenueOverview')}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                      {Object.entries(analytics.revenue).map(([key, val], i) => (
                        <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>€{Number(val).toFixed(2)}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
