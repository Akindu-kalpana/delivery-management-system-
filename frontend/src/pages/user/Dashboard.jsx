import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const DriverInstructionsEditor = ({ delivery, token, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(delivery.driver_instructions || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(
        `http://localhost:5000/api/deliveries/${delivery.id}/instructions`,
        { driver_instructions: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(false);
      onUpdated();
    } catch (_e) {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (delivery.status === 'delivered') return null;

  return (
    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>
        📝 Driver Instructions
      </div>
      {editing ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Leave at door, call before delivery..."
            rows={2}
            style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button onClick={save} disabled={saving} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {saving ? '...' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setValue(delivery.driver_instructions || ''); }} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: value ? '#1e293b' : '#94a3b8', fontStyle: value ? 'normal' : 'italic' }}>
            {value || 'No special instructions'}
          </span>
          <button onClick={() => setEditing(true)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            ✏️ Edit
          </button>
        </div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/deliveries/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(res.data.deliveries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'picked_up': return '#3b82f6';
      case 'in_transit': return '#8b5cf6';
      case 'delivered': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '80px', maxWidth: '1200px', margin: '0 auto', padding: '80px 20px 40px'}}>

        {/* Welcome header */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '32px', marginBottom: '32px', color: 'white'}}>
          <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '8px'}}>
            👋 {t('dashboard.welcome')}, {user?.name}!
          </h1>
          <p style={{opacity: 0.8}}>{t('dashboard.manageDeliveries')}</p>
        </div>

        {/* Quick actions */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px'}}>
          {[
            { icon: '📦', label: t('dashboard.bookDelivery'), path: '/user/book', color: '#2563eb' },
            { icon: '📍', label: t('dashboard.trackDelivery'), path: '/user/track', color: '#7c3aed' },
            { icon: '📋', label: t('dashboard.deliveryHistory'), path: '/user/history', color: '#059669' },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.path}
              style={{background: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid transparent', transition: 'all 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.borderColor = action.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{fontSize: '40px', marginBottom: '12px'}}>{action.icon}</div>
              <div style={{fontWeight: '600', color: action.color}}>{action.label}</div>
            </Link>
          ))}
        </div>

        {/* Recent deliveries */}
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b'}}>
            📦 {t('dashboard.myDeliveries')}
          </h2>

          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>{t('dashboard.loading')}</div>
          ) : deliveries.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>📭</div>
              <p style={{color: '#94a3b8', marginBottom: '16px'}}>{t('dashboard.noDeliveries')}</p>
              <Link
                to="/user/book"
                style={{background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600'}}
              >
                {t('dashboard.bookFirst')}
              </Link>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {deliveries.map((delivery) => (
                <div key={delivery.id} style={{border: '1px solid #f1f5f9', borderRadius: '10px', padding: '16px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px'}}>
                    <div style={{display: 'flex', gap: '16px', fontSize: '14px', flexWrap: 'wrap'}}>
                      <span style={{color: '#64748b'}}>#{delivery.id}</span>
                      <span style={{fontWeight: '600', color: '#1e293b'}}>{delivery.receiver_name}</span>
                      <span style={{color: '#475569'}}>{delivery.delivery_address}</span>
                      <span style={{color: '#94a3b8'}}>{new Date(delivery.created_at).toLocaleDateString()}</span>
                    </div>
                    <span style={{background: getStatusColor(delivery.status), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap'}}>
                      {t(`tracking.status.${delivery.status}`)}
                    </span>
                  </div>
                  <DriverInstructionsEditor delivery={delivery} token={token} onUpdated={fetchDeliveries} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
