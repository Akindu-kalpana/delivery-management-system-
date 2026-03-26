import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const PriceEstimate = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const prefill = location.state || {};

  const [form, setForm] = useState({
    pickup_address: prefill.pickup_address || '',
    delivery_address: prefill.delivery_address || '',
    delivery_option: prefill.delivery_option || 'standard',
    package_size: prefill.package_size || 'small',
    package_weight: prefill.package_weight || '',
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedAddresses(res.data.addresses || []);
    } catch (err) {
      // silently fail
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/price/estimate',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get price estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookThis = () => {
    navigate('/user/book', { state: form });
  };

  const inputStyle = {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    background: 'white',
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
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '96px 20px 40px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '28px', marginBottom: '28px', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px' }}>
            💰 {t('price.title')}
          </h1>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>
            {t('price.subtitle')}
          </p>
        </div>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '20px' }}>

              {/* Pickup Address */}
              <div>
                <label style={labelStyle}>{t('price.pickupAddress')}</label>
                {savedAddresses.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) setForm({ ...form, pickup_address: e.target.value });
                    }}
                    style={{ ...inputStyle, marginBottom: '6px', color: '#64748b' }}
                  >
                    <option value="">{t('price.savedAddressSelect')}</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.address}>{addr.label}: {addr.address}</option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  name="pickup_address"
                  value={form.pickup_address}
                  onChange={handleChange}
                  placeholder="e.g. Kauppurienkatu 25, Oulu"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label style={labelStyle}>{t('price.deliveryAddress')}</label>
                <input
                  type="text"
                  name="delivery_address"
                  value={form.delivery_address}
                  onChange={handleChange}
                  placeholder="e.g. Aleksanterinkatu 10, Helsinki"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Delivery Option + Package Size */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>{t('price.deliveryOption')}</label>
                  <select name="delivery_option" value={form.delivery_option} onChange={handleChange} style={inputStyle}>
                    <option value="standard">{t('price.options.standard')}</option>
                    <option value="express">{t('price.options.express')}</option>
                    <option value="same_day">{t('price.options.same_day')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('price.packageSize')}</label>
                  <select name="package_size" value={form.package_size} onChange={handleChange} style={inputStyle}>
                    <option value="xs">{t('price.sizes.xs')}</option>
                    <option value="small">{t('price.sizes.small')}</option>
                    <option value="medium">{t('price.sizes.medium')}</option>
                    <option value="large">{t('price.sizes.large')}</option>
                    <option value="xl">{t('price.sizes.xl')}</option>
                  </select>
                </div>
              </div>

              {/* Package Weight */}
              <div>
                <label style={labelStyle}>{t('price.packageWeight')}</label>
                <input
                  type="number"
                  name="package_weight"
                  value={form.package_weight}
                  onChange={handleChange}
                  placeholder="e.g. 2.5"
                  min="0.1"
                  step="0.1"
                  required
                  style={inputStyle}
                />
              </div>

              {error && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#93c5fd' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? `⏳ ${t('price.calculating')}` : `💰 ${t('price.calculate')}`}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              📊 {t('price.breakdown')}
            </h2>

            {/* Distance */}
            {result.distance_km && (
              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>📍</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#1d4ed8' }}>{t('price.estimatedDistance')}</div>
                  <div style={{ color: '#3b82f6', fontSize: '22px', fontWeight: 'bold' }}>{result.distance_km} km</div>
                </div>
              </div>
            )}

            {/* Price rows */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              {[
                { label: t('price.basePrice'), value: result.base_price, icon: '🏷️' },
                { label: t('price.sizeSurcharge'), value: result.size_surcharge, icon: '📦' },
                { label: t('price.weightSurcharge'), value: result.weight_surcharge, icon: '⚖️' },
                { label: t('price.optionSurcharge'), value: result.option_surcharge, icon: '🚀' },
              ].filter(row => row.value !== undefined && row.value !== null).map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>{row.icon} {row.label}</div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>€{Number(row.value).toFixed(2)}</div>
                </div>
              ))}
              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 18px', background: '#1d4ed8' }}>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>💳 {t('price.total')}</div>
                <div style={{ fontWeight: 'bold', color: 'white', fontSize: '24px' }}>€{Number(result.total_price || result.total).toFixed(2)}</div>
              </div>
            </div>

            {/* Book button */}
            <button
              onClick={handleBookThis}
              style={{
                marginTop: '20px',
                width: '100%',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              🚀 {t('price.bookThis')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceEstimate;
