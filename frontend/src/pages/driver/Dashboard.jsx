import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const DriverDashboard = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchDeliveries();
  }, [token]);

  const fetchDeliveries = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await axios.get('http://localhost:5000/api/deliveries/driver', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(res.data.deliveries || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load deliveries';
      setFetchError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await axios.put(
        `http://localhost:5000/api/deliveries/${id}/status`,
        { status, driver_id: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDeliveries();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'picked_up': return '#3b82f6';
      case 'in_transit': return '#8b5cf6';
      case 'delivered': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getNextStatus = (status) => {
    switch (status) {
      case 'pending': return 'picked_up';
      case 'picked_up': return 'in_transit';
      case 'in_transit': return 'delivered';
      default: return null;
    }
  };

  const getNextStatusLabel = (status) => {
    switch (status) {
      case 'pending': return `📦 ${t('dashboard.driver.markPickedUp')}`;
      case 'picked_up': return `🚚 ${t('dashboard.driver.markInTransit')}`;
      case 'in_transit': return `✅ ${t('dashboard.driver.markDelivered')}`;
      default: return null;
    }
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{maxWidth: '1000px', margin: '0 auto', padding: '80px 20px 40px'}}>

        {/* Header */}
        <div style={{background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: '16px', padding: '32px', marginBottom: '32px', color: 'white'}}>
          <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '8px'}}>
            🚚 {t('dashboard.welcome')}, {user?.name}!
          </h1>
          <p style={{opacity: 0.8}}>{t('dashboard.driver.manageDeliveries')}</p>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px'}}>
          {[
            { label: t('dashboard.driver.stats.totalAssigned'), value: deliveries.length, color: '#7c3aed' },
            { label: t('dashboard.driver.stats.pending'), value: deliveries.filter(d => d.status === 'pending').length, color: '#f59e0b' },
            { label: t('dashboard.driver.stats.inTransit'), value: deliveries.filter(d => d.status === 'in_transit').length, color: '#3b82f6' },
            { label: t('dashboard.driver.stats.delivered'), value: deliveries.filter(d => d.status === 'delivered').length, color: '#10b981' },
          ].map((stat, index) => (
            <div key={index} style={{background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
              <div style={{fontSize: '32px', fontWeight: 'bold', color: stat.color}}>{stat.value}</div>
              <div style={{fontSize: '13px', color: '#64748b', marginTop: '4px'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Deliveries */}
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b'}}>
            📦 {t('dashboard.assignedDeliveries')}
          </h2>

          {fetchError && (
            <div style={{background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px'}}>
              ⚠️ {fetchError}
            </div>
          )}

          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>{t('dashboard.loading')}</div>
          ) : deliveries.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>📭</div>
              <p style={{color: '#94a3b8'}}>{t('dashboard.driver.noDeliveries')}</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {deliveries.map((delivery) => (
                <div key={delivery.id} style={{border: '1px solid #f1f5f9', borderRadius: '12px', padding: '20px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '16px'}}>
                      {t('tracking.delivery')} #{delivery.id}
                    </div>
                    <span style={{background: getStatusColor(delivery.status), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                      {t(`tracking.status.${delivery.status}`)}
                    </span>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px', marginBottom: '16px'}}>
                    <div>
                      <div style={{color: '#64748b', marginBottom: '2px'}}>{t('dashboard.driver.pickup')}</div>
                      <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.pickup_address}</div>
                    </div>
                    <div>
                      <div style={{color: '#64748b', marginBottom: '2px'}}>{t('dashboard.driver.delivery')}</div>
                      <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.delivery_address}</div>
                    </div>
                    <div>
                      <div style={{color: '#64748b', marginBottom: '2px'}}>{t('dashboard.driver.receiver')}</div>
                      <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.receiver_name}</div>
                      <div style={{color: '#64748b', fontSize: '12px'}}>{delivery.receiver_phone}</div>
                    </div>
                  </div>

                  {getNextStatus(delivery.status) && (
                    <button
                      onClick={() => updateStatus(delivery.id, getNextStatus(delivery.status))}
                      disabled={updating === delivery.id}
                      style={{background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', opacity: updating === delivery.id ? 0.5 : 1}}
                    >
                      {updating === delivery.id ? t('dashboard.driver.updating') : getNextStatusLabel(delivery.status)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
