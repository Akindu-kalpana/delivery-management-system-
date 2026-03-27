import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';

const DeliveryHistory = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      <div style={{maxWidth: '1000px', margin: '0 auto', padding: '96px 20px 40px'}}>

        {/* Header */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white'}}>
          <BackButton />
          <h1 style={{fontSize: '24px', fontWeight: 'bold'}}>📋 {t('dashboard.myDeliveries')}</h1>
          <p style={{opacity: 0.8, fontSize: '14px', marginTop: '4px'}}>{t('dashboard.history.subtitle')}</p>
        </div>

        {/* Deliveries */}
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>{t('dashboard.loading')}</div>
          ) : deliveries.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>📭</div>
              <p style={{color: '#94a3b8'}}>{t('dashboard.noHistory')}</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  style={{border: '1px solid #f1f5f9', borderRadius: '12px', padding: '20px', transition: 'all 0.2s'}}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                    <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '16px'}}>
                      {t('tracking.delivery')} #{delivery.id}
                    </div>
                    <span style={{background: getStatusColor(delivery.status), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                      {t(`tracking.status.${delivery.status}`) || delivery.status}
                    </span>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px'}}>
                    <div>
                      <div style={{color: '#64748b', marginBottom: '2px'}}>{t('dashboard.history.from')}</div>
                      <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.sender_name}</div>
                      <div style={{color: '#64748b', fontSize: '12px'}}>{delivery.pickup_address}</div>
                    </div>
                    <div>
                      <div style={{color: '#64748b', marginBottom: '2px'}}>{t('dashboard.history.to')}</div>
                      <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.receiver_name}</div>
                      <div style={{color: '#64748b', fontSize: '12px'}}>{delivery.delivery_address}</div>
                    </div>
                    {delivery.package_description && (
                      <div>
                        <div style={{color: '#64748b', marginBottom: '2px'}}>{t('dashboard.history.package')}</div>
                        <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.package_description}</div>
                      </div>
                    )}
                    <div>
                      <div style={{color: '#64748b', marginBottom: '2px'}}>{t('dashboard.history.date')}</div>
                      <div style={{fontWeight: '600', color: '#1e293b'}}>{new Date(delivery.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryHistory;
