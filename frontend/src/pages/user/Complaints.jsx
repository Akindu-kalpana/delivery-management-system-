import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const Complaints = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('file');
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    delivery_id: '',
    type: 'late_delivery',
    description: '',
  });

  useEffect(() => {
    if (activeTab === 'mine') {
      fetchComplaints();
    }
  }, [activeTab]);

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const res = await axios.get('http://localhost:5000/api/complaints/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      setError('Failed to load complaints.');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(
        'http://localhost:5000/api/complaints',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Your complaint has been submitted successfully. We will review it shortly.');
      setForm({ delivery_id: '', type: 'late_delivery', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: { background: '#fef3c7', color: '#d97706', label: t('complaints.status.open') },
      in_review: { background: '#dbeafe', color: '#2563eb', label: t('complaints.status.in_review') },
      resolved: { background: '#dcfce7', color: '#16a34a', label: t('complaints.status.resolved') },
      closed: { background: '#f1f5f9', color: '#64748b', label: t('complaints.status.closed') },
    };
    const s = styles[status] || styles.open;
    return (
      <span style={{ background: s.background, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
        {s.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const labels = {
      late_delivery: t('complaints.types.late_delivery'),
      damage: t('complaints.types.damage'),
      lost_package: t('complaints.types.lost_package'),
      wrong_address: t('complaints.types.wrong_address'),
      other: t('complaints.types.other'),
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      late_delivery: '⏰',
      damage: '💔',
      lost_package: '🔍',
      wrong_address: '📍',
      other: '❓',
    };
    return icons[type] || '❓';
  };

  const inputStyle = {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    fontSize: '14px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 20px 40px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '28px', marginBottom: '28px', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px' }}>
            📣 {t('complaints.title')}
          </h1>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>{t('complaints.subtitle')}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          {[
            { key: 'file', label: `📝 ${t('complaints.fileTab')}` },
            { key: 'mine', label: `📋 ${t('complaints.myTab')}` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                background: activeTab === tab.key ? '#2563eb' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
            ✅ {success}
          </div>
        )}

        {/* File Complaint Tab */}
        {activeTab === 'file' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              {t('complaints.fileTitle')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '18px' }}>
                <div>
                  <label style={labelStyle}>{t('complaints.deliveryId')}</label>
                  <input
                    type="number"
                    value={form.delivery_id}
                    onChange={(e) => setForm({ ...form, delivery_id: e.target.value })}
                    placeholder="Enter delivery ID if applicable"
                    style={inputStyle}
                  />
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>{t('complaints.deliveryIdHint')}</p>
                </div>

                <div>
                  <label style={labelStyle}>{t('complaints.type')}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value="late_delivery">⏰ {t('complaints.types.late_delivery')}</option>
                    <option value="damage">💔 {t('complaints.types.damage')}</option>
                    <option value="lost_package">🔍 {t('complaints.types.lost_package')}</option>
                    <option value="wrong_address">📍 {t('complaints.types.wrong_address')}</option>
                    <option value="other">❓ {t('complaints.types.other')}</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>{t('complaints.description')}</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={t('complaints.descPlaceholder')}
                    required
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: submitting ? '#93c5fd' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? `⏳ ${t('complaints.submitting')}` : `📤 ${t('complaints.submit')}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Complaints Tab */}
        {activeTab === 'mine' && (
          <div>
            {loadingComplaints ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
                Loading complaints...
              </div>
            ) : complaints.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <p style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>{t('complaints.noComplaints')}</p>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>{t('complaints.noComplaintsHint')}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {complaints.map((c) => (
                  <div key={c.id} style={{ background: 'white', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px', marginBottom: '4px' }}>
                          {getTypeIcon(c.type)} {getTypeLabel(c.type)}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                          Complaint #{c.id} {c.delivery_id ? `· Delivery #${c.delivery_id}` : ''} · {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {getStatusBadge(c.status)}
                    </div>
                    <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: c.admin_response ? '12px' : '0' }}>
                      {c.description}
                    </p>
                    {c.admin_response && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
                        <div style={{ fontWeight: '600', color: '#16a34a', fontSize: '13px', marginBottom: '4px' }}>{t('complaints.adminResponse')}</div>
                        <p style={{ color: '#166534', fontSize: '13px', margin: 0 }}>{c.admin_response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
