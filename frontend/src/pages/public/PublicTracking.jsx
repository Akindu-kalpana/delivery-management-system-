import API_URL from '../../api.js';
import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';

const PublicTracking = () => {
  const { t } = useTranslation();
  const [deliveryId, setDeliveryId] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const trackDelivery = async () => {
    if (!deliveryId.trim()) return;
    setLoading(true);
    setError('');
    setDelivery(null);

    try {
      const res = await axios.get(`${API_URL}/api/deliveries/public/${deliveryId}`);
      setDelivery(res.data.delivery);
    } catch (err) {
      setError(t('publicTracking.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const steps = ['pending', 'picked_up', 'in_transit', 'delivered'];

  const getStepIcon = (step) => {
    switch (step) {
      case 'pending': return '📋';
      case 'picked_up': return '📦';
      case 'in_transit': return '🚚';
      case 'delivered': return '✅';
      default: return '⭕';
    }
  };

  const getStepColor = (step, currentStatus) => {
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);
    if (stepIndex <= currentIndex) return '#2563eb';
    return '#e2e8f0';
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '80px'}}>

        {/* Hero */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '60px 20px 80px', textAlign: 'center', color: 'white'}}>
          <div style={{maxWidth: '700px', margin: '0 auto', textAlign: 'left', marginBottom: '24px'}}><BackButton /></div>
          <h1 className="hero-h1-responsive" style={{fontSize: '42px', fontWeight: 'bold', marginBottom: '16px'}}>📍 {t('publicTracking.title')}</h1>
          <p style={{fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto'}}>
            {t('publicTracking.subtitle')}
          </p>
        </div>

        <div style={{maxWidth: '700px', margin: '0 auto', padding: '60px 20px'}}>

          {/* Search */}
          <div style={{background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px'}}>
            <h2 style={{fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px'}}>{t('publicTracking.enterDeliveryId')}</h2>
            <div className="track-search-wrap" style={{display: 'flex', gap: '12px'}}>
              <input
                type="number"
                value={deliveryId}
                onChange={(e) => setDeliveryId(e.target.value)}
                placeholder={t('publicTracking.placeholder')}
                style={{flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', fontSize: '16px', outline: 'none'}}
                onKeyDown={(e) => e.key === 'Enter' && trackDelivery()}
              />
              <button
                onClick={trackDelivery}
                disabled={loading}
                style={{background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '14px 28px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap'}}
              >
                {loading ? '...' : t('publicTracking.track')}
              </button>
            </div>

            {error && (
              <div style={{background: '#fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginTop: '12px', fontSize: '14px'}}>
                {error}
              </div>
            )}
          </div>

          {/* Result */}
          {delivery && (
            <div style={{background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
              <h3 style={{fontWeight: 'bold', color: '#1e293b', marginBottom: '24px', fontSize: '18px'}}>
                {t('publicTracking.delivery')} #{delivery.id}
              </h3>

              {/* Progress steps */}
              <div style={{overflowX: 'auto', marginBottom: '32px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', minWidth: '280px'}}>
                <div style={{position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0}}></div>
                {steps.map((step) => (
                  <div key={step} style={{textAlign: 'center', zIndex: 1, flex: 1}}>
                    <div style={{width: '40px', height: '40px', borderRadius: '50%', background: getStepColor(step, delivery.status), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '18px'}}>
                      {getStepIcon(step)}
                    </div>
                    <div className="status-steps-label" style={{fontSize: '11px', color: getStepColor(step, delivery.status) === '#2563eb' ? '#2563eb' : '#94a3b8', fontWeight: '600'}}>
                      {t(`tracking.status.${step}`)}
                    </div>
                  </div>
                ))}
              </div>
              </div>

              {/* Delivery details */}
              <div style={{background: '#f8fafc', borderRadius: '12px', padding: '20px'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px'}}>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('publicTracking.sender')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.sender_name}</div>
                  </div>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('publicTracking.receiver')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.receiver_name}</div>
                  </div>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('publicTracking.pickupAddress')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.pickup_address}</div>
                  </div>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('publicTracking.deliveryAddress')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.delivery_address}</div>
                  </div>
                  <div style={{gridColumn: '1/-1'}}>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('publicTracking.bookedOn')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{new Date(delivery.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{background: '#1e293b', color: '#94a3b8', padding: '40px 20px', textAlign: 'center'}}>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>🚚 NKR Delivery</div>
          <p style={{marginBottom: '16px'}}>Nopeiden Kuljetusten Ritarit AY</p>
          <p style={{fontSize: '13px'}}>{t('publicTracking.footer.copyright')}</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicTracking;
