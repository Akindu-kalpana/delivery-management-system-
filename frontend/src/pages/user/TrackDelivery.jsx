import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const TrackDelivery = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
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
      const res = await axios.get(`http://localhost:5000/api/deliveries/track/${deliveryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDelivery(res.data.delivery);
    } catch (err) {
      setError('Delivery not found. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['pending', 'picked_up', 'in_transit', 'delivered'];
  
  const getStepColor = (step, currentStatus) => {
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);
    if (stepIndex <= currentIndex) return '#2563eb';
    return '#e2e8f0';
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 'pending': return '📋';
      case 'picked_up': return '📦';
      case 'in_transit': return '🚚';
      case 'delivered': return '✅';
      default: return '⭕';
    }
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '80px', maxWidth: '700px', margin: '0 auto', padding: '80px 20px 40px'}}>
        
        {/* Header */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white', textAlign: 'center'}}>
          <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '4px'}}>📍 {t('tracking.title')}</h1>
          <p style={{opacity: 0.8, fontSize: '14px'}}>Enter your delivery ID to track your package</p>
        </div>

        {/* Search */}
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px'}}>
          <label style={{display: 'block', fontWeight: '600', color: '#1e293b', marginBottom: '8px'}}>{t('tracking.id')}</label>
          <div style={{display: 'flex', gap: '12px'}}>
            <input
              type="number"
              value={deliveryId}
              onChange={(e) => setDeliveryId(e.target.value)}
              placeholder="Enter delivery ID (e.g. 1)"
              style={{flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', outline: 'none', fontSize: '14px'}}
            />
            <button
              onClick={trackDelivery}
              disabled={loading}
              style={{background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer'}}
            >
              {loading ? '...' : t('tracking.search')}
            </button>
          </div>

          {error && (
            <div style={{background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '14px'}}>
              {error}
            </div>
          )}
        </div>

        {/* Delivery details */}
        {delivery && (
          <div style={{background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
            
            {/* Status steps */}
            <h3 style={{fontWeight: 'bold', color: '#1e293b', marginBottom: '24px'}}>Delivery #{delivery.id}</h3>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative'}}>
              <div style={{position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0}}></div>
              {steps.map((step, index) => (
                <div key={step} style={{textAlign: 'center', zIndex: 1, flex: 1}}>
                  <div style={{width: '40px', height: '40px', borderRadius: '50%', background: getStepColor(step, delivery.status), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '18px'}}>
                    {getStepIcon(step)}
                  </div>
                  <div style={{fontSize: '11px', color: getStepColor(step, delivery.status) === '#2563eb' ? '#2563eb' : '#94a3b8', fontWeight: '600'}}>
                    {t(`tracking.status.${step}`)}
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery info */}
            <div style={{background: '#f8fafc', borderRadius: '12px', padding: '20px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px'}}>
                <div>
                  <div style={{color: '#64748b', marginBottom: '4px'}}>Sender</div>
                  <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.sender_name}</div>
                  <div style={{color: '#64748b'}}>{delivery.sender_phone}</div>
                </div>
                <div>
                  <div style={{color: '#64748b', marginBottom: '4px'}}>Receiver</div>
                  <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.receiver_name}</div>
                  <div style={{color: '#64748b'}}>{delivery.receiver_phone}</div>
                </div>
                <div>
                  <div style={{color: '#64748b', marginBottom: '4px'}}>Pickup Address</div>
                  <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.pickup_address}</div>
                </div>
                <div>
                  <div style={{color: '#64748b', marginBottom: '4px'}}>Delivery Address</div>
                  <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.delivery_address}</div>
                </div>
                {delivery.package_description && (
                  <div style={{gridColumn: '1/-1'}}>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>Package</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.package_description}</div>
                  </div>
                )}
                <div style={{gridColumn: '1/-1'}}>
                  <div style={{color: '#64748b', marginBottom: '4px'}}>Booked on</div>
                  <div style={{fontWeight: '600', color: '#1e293b'}}>{new Date(delivery.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackDelivery;