import API_URL from '../../api.js';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const pickupIcon = L.divIcon({
  html: '<div style="background:#2563eb;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;"></div>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const deliveryIcon = L.divIcon({
  html: '<div style="background:#16a34a;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const truckIcon = L.divIcon({
  html: '🚚',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const DEFAULT_CENTER = [65.0124, 25.4682]; // Oulu, Finland

const geocode = async (address) => {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: address + ', Finland', format: 'json', limit: 1 },
      headers: { 'User-Agent': 'NKRDelivery/1.0' }
    });
    if (res.data && res.data.length > 0) {
      return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
    }
  } catch (e) {
    // geocoding failed
  }
  return null;
};

const getTruckPosition = (pickupPos, deliveryPos, status) => {
  if (!pickupPos || !deliveryPos) return pickupPos || deliveryPos || null;
  switch (status) {
    case 'pending':
      return pickupPos;
    case 'picked_up':
      return pickupPos;
    case 'in_transit':
      return {
        lat: (pickupPos.lat + deliveryPos.lat) / 2,
        lng: (pickupPos.lng + deliveryPos.lng) / 2,
      };
    case 'delivered':
      return deliveryPos;
    default:
      return pickupPos;
  }
};

const TrackDelivery = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [deliveryId, setDeliveryId] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Map state
  const [pickupPos, setPickupPos] = useState(null);
  const [deliveryPos, setDeliveryPos] = useState(null);
  const [truckPos, setTruckPos] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  const trackDelivery = async () => {
    if (!deliveryId.trim()) return;
    setLoading(true);
    setError('');
    setDelivery(null);
    setPickupPos(null);
    setDeliveryPos(null);
    setTruckPos(null);

    try {
      const res = await axios.get(`${API_URL}/api/deliveries/track/${deliveryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = res.data.delivery;
      setDelivery(d);
      geocodeAddresses(d);
    } catch (err) {
      setError(t('tracking.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddresses = async (d) => {
    setGeocoding(true);
    try {
      const [pPos, dPos] = await Promise.all([
        geocode(d.pickup_address),
        geocode(d.delivery_address),
      ]);
      setPickupPos(pPos);
      setDeliveryPos(dPos);
      setTruckPos(getTruckPosition(pPos, dPos, d.status));
    } finally {
      setGeocoding(false);
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

  const mapCenter = pickupPos || deliveryPos || { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '80px', maxWidth: '700px', margin: '0 auto', padding: '96px 20px 40px'}}>

        {/* Header */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white', textAlign: 'center'}}>
          <div style={{textAlign: 'left'}}><BackButton /></div>
          <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '4px'}}>📍 {t('tracking.title')}</h1>
          <p style={{opacity: 0.8, fontSize: '14px'}}>{t('tracking.subtitle')}</p>
        </div>

        {/* Search */}
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px'}}>
          <label style={{display: 'block', fontWeight: '600', color: '#1e293b', marginBottom: '8px'}}>{t('tracking.id')}</label>
          <div className="track-search-wrap" style={{display: 'flex', gap: '12px'}}>
            <input
              type="number"
              value={deliveryId}
              onChange={(e) => setDeliveryId(e.target.value)}
              placeholder={t('tracking.placeholder')}
              style={{flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', outline: 'none', fontSize: '14px'}}
              onKeyDown={(e) => e.key === 'Enter' && trackDelivery()}
            />
            <button
              onClick={trackDelivery}
              disabled={loading}
              style={{background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap'}}
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
          <>
            <div style={{background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px'}}>

              {/* Status steps */}
              <h3 style={{fontWeight: 'bold', color: '#1e293b', marginBottom: '24px'}}>{t('tracking.delivery')} #{delivery.id}</h3>

              <div style={{overflowX: 'auto', marginBottom: '32px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', minWidth: '280px'}}>
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

              {/* Delivery info */}
              <div style={{background: '#f8fafc', borderRadius: '12px', padding: '20px'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px'}}>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('tracking.sender')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.sender_name}</div>
                    <div style={{color: '#64748b'}}>{delivery.sender_phone}</div>
                  </div>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('tracking.receiver')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.receiver_name}</div>
                    <div style={{color: '#64748b'}}>{delivery.receiver_phone}</div>
                  </div>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('tracking.pickupAddress')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.pickup_address}</div>
                  </div>
                  <div>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('tracking.deliveryAddress')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.delivery_address}</div>
                  </div>
                  {delivery.package_description && (
                    <div style={{gridColumn: '1/-1'}}>
                      <div style={{color: '#64748b', marginBottom: '4px'}}>{t('tracking.package')}</div>
                      <div style={{fontWeight: '600', color: '#1e293b'}}>{delivery.package_description}</div>
                    </div>
                  )}
                  <div style={{gridColumn: '1/-1'}}>
                    <div style={{color: '#64748b', marginBottom: '4px'}}>{t('tracking.bookedOn')}</div>
                    <div style={{fontWeight: '600', color: '#1e293b'}}>{new Date(delivery.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div style={{background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px'}}>
              <div style={{padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3 style={{fontWeight: 'bold', color: '#1e293b', margin: 0, fontSize: '16px'}}>
                  🗺️ Live Tracking Map
                </h3>
                {geocoding && <span style={{fontSize: '13px', color: '#94a3b8'}}>Locating addresses...</span>}
              </div>

              <div style={{height: '350px', position: 'relative'}}>
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={pickupPos && deliveryPos ? 9 : 11}
                  style={{height: '100%', width: '100%'}}
                  key={`${mapCenter.lat}-${mapCenter.lng}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {pickupPos && (
                    <Marker position={[pickupPos.lat, pickupPos.lng]} icon={pickupIcon}>
                      <Popup>
                        <div style={{fontWeight: '600', color: '#2563eb'}}>📦 Pickup</div>
                        <div style={{fontSize: '13px', color: '#475569', marginTop: '4px'}}>{delivery.pickup_address}</div>
                      </Popup>
                    </Marker>
                  )}

                  {deliveryPos && (
                    <Marker position={[deliveryPos.lat, deliveryPos.lng]} icon={deliveryIcon}>
                      <Popup>
                        <div style={{fontWeight: '600', color: '#16a34a'}}>🏠 Delivery</div>
                        <div style={{fontSize: '13px', color: '#475569', marginTop: '4px'}}>{delivery.delivery_address}</div>
                      </Popup>
                    </Marker>
                  )}

                  {truckPos && delivery.status !== 'delivered' && delivery.status !== 'pending' && (
                    <Marker position={[truckPos.lat, truckPos.lng]} icon={truckIcon}>
                      <Popup>
                        <div style={{fontWeight: '600', color: '#f59e0b'}}>🚚 Delivery Truck</div>
                        <div style={{fontSize: '13px', color: '#475569', marginTop: '4px'}}>
                          Status: {delivery.status.replace(/_/g, ' ')}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              {/* Map legend */}
              <div style={{padding: '12px 20px', background: '#f8fafc', display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <div style={{width: '14px', height: '14px', borderRadius: '50%', background: '#2563eb'}} />
                  Pickup
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <div style={{width: '14px', height: '14px', borderRadius: '50%', background: '#16a34a'}} />
                  Delivery
                </div>
                {truckPos && delivery.status !== 'delivered' && delivery.status !== 'pending' && (
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                    🚚 Current Position
                  </div>
                )}
                {!pickupPos && !deliveryPos && !geocoding && (
                  <span style={{color: '#f59e0b'}}>⚠️ Could not geocode addresses — showing default location</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackDelivery;
