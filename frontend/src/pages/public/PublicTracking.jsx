import { useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { useTranslation } from 'react-i18next';

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
      const res = await axios.get(`http://localhost:5000/api/deliveries/public/${deliveryId}`);
      setDelivery(res.data.delivery);
    } catch (err) {
      setError('Delivery not found. Please check the ID and try again.');
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

      <div style={{paddingTop: '64px'}}>

        {/* Hero */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '80px 20px', textAlign: 'center', color: 'white'}}>
          <h1 style={{fontSize: '42px', fontWeight: 'bold', marginBottom: '16px'}}>📍 Track Your Delivery</h1>
          <p style={{fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto'}}>
            Enter your delivery ID to track your package in real time
          </p>
        </div>

        <div style={{maxWidth: '700px', margin: '0 auto', padding: '60px 20px'}}>

          {/* Search */}
          <div style={{background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px'}}>
            <h2 style={{fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px'}}>Enter Delivery ID</h2>
            <div style={{display: 'flex', gap: '12px'}}>
              <input
                type="number"
                value={deliveryId}
                onChange={(e) => setDeliveryId(e.target.value)}
                placeholder="Enter your delivery ID (e.g. 1)"
                style={{flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', fontSize: '16px', outline: 'none'}}
                onKeyPress={(e) => e.key === 'Enter' && trackDelivery()}
              />
              <button
                onClick={trackDelivery}
                disabled={loading}
                style={{background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '14px 28px', fontWeight: '600', fontSize: '16px', cursor: 'pointer'}}
              >
                {loading ? '...' : 'Track'}
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
                Delivery #{delivery.id}
              </h3>

              {/* Progress steps */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', position: 'relative'}}>
                <div style={{position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0}}></div>
                {steps.map((step) => (
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

              {/* Delivery details */}
              <div style={{background: '#f8fafc', borderRadius: '12px', padding: '20px'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px'}}>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>Sender</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.sender_name}</div>
                  </div>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>Receiver</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.receiver_name}</div>
                  </div>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>Pickup Address</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.pickup_address}</div>
                  </div>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>Delivery Address</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.delivery_address}</div>
                  </div>
                  <div style={{gridColumn: '1/-1'}}>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>Booked on</div>
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
          <p style={{fontSize: '13px'}}>© 2025 Nopeiden Kuljetusten Ritarit AY. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicTracking;