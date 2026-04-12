import API_URL from '../../api.js';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';

const SavedAddresses = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ label: '', address: '', is_default: false });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data.addresses || []);
    } catch (err) {
      setError('Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/api/addresses/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Address updated successfully!');
      } else {
        await axios.post(
          `${API_URL}/api/addresses`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Address saved successfully!');
      }
      setForm({ label: '', address: '', is_default: false });
      setShowForm(false);
      setEditingId(null);
      fetchAddresses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setForm({ label: addr.label, address: addr.address, is_default: addr.is_default || false });
    setEditingId(addr.id);
    setShowForm(true);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('addresses.deleteConfirm'))) return;
    setError('');
    try {
      await axios.delete(`${API_URL}/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Address deleted.');
      fetchAddresses();
    } catch (err) {
      setError('Failed to delete address.');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ label: '', address: '', is_default: false });
    setError('');
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '96px 20px 40px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '28px', marginBottom: '28px', color: 'white', textAlign: 'center' }}>
          <div style={{textAlign: 'left'}}><BackButton /></div>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px' }}>
            📍 {t('addresses.title')}
          </h1>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>{t('addresses.subtitle')}</p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              {editingId ? `✏️ ${t('addresses.editTitle')}` : `➕ ${t('addresses.addNew')}`}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '14px' }}>
                    {t('addresses.label')}
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="e.g. Home"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '14px' }}>
                    {t('addresses.address')}
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. Kauppurienkatu 25, Oulu"
                    required
                    style={inputStyle}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  {t('addresses.setDefault')}
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ flex: 1, background: saving ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}
                  >
                    {saving ? t('addresses.saving') : editingId ? t('addresses.update') : t('addresses.save')}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '12px 20px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {t('addresses.cancel')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ label: '', address: '', is_default: false }); }}
            style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', marginBottom: '24px' }}
          >
            ➕ {t('addresses.addNew')}
          </button>
        )}

        {/* Addresses List */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
              {t('addresses.loading')}
            </div>
          ) : addresses.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>{t('addresses.empty')}</p>
              <p style={{ color: '#cbd5e1', fontSize: '14px' }}>{t('addresses.emptyHint')}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    background: 'white',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: addr.is_default ? '2px solid #2563eb' : '2px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>
                        📍 {addr.label}
                      </span>
                      {addr.is_default && (
                        <span style={{ background: '#2563eb', color: 'white', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px' }}>
                          {t('addresses.default')}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>{addr.address}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(addr)}
                      style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                    >
                      🗑️ Delete
                    </button>
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

export default SavedAddresses;
