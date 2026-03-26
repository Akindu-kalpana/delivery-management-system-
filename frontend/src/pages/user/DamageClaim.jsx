import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const DamageClaim = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [step, setStep] = useState(1);
  const [deliveries, setDeliveries] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [selectedDelivery, setSelectedDelivery] = useState('');
  const [description, setDescription] = useState('');
  const [damagePhotos, setDamagePhotos] = useState([]);
  const [invoiceImage, setInvoiceImage] = useState(null);
  const [damagePhotoPreviews, setDamagePhotoPreviews] = useState([]);
  const [invoicePreview, setInvoicePreview] = useState(null);

  const damageInputRef = useRef(null);
  const invoiceInputRef = useRef(null);

  useEffect(() => {
    fetchDeliveries();
    fetchClaims();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/deliveries/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(res.data.deliveries || []);
    } catch (err) {
      // silent
    }
  };

  const fetchClaims = async () => {
    setLoadingClaims(true);
    try {
      const res = await axios.get('http://localhost:5000/api/damage-claims/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(res.data.claims || []);
    } catch (err) {
      // silent
    } finally {
      setLoadingClaims(false);
    }
  };

  const handleDamagePhotos = (files) => {
    const fileArr = Array.from(files);
    setDamagePhotos(fileArr);
    setDamagePhotoPreviews(fileArr.map(f => URL.createObjectURL(f)));
  };

  const handleInvoiceImage = (file) => {
    if (!file) return;
    setInvoiceImage(file);
    setInvoicePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleDamagePhotos(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!selectedDelivery || !description) {
      setError(t('damage.selectDelivery') + ' ' + t('damage.describeFirst'));
      return;
    }
    setSubmitting(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('delivery_id', selectedDelivery);
    formData.append('description', description);
    damagePhotos.forEach((photo) => formData.append('damage_photos', photo));
    if (invoiceImage) formData.append('invoice_image', invoiceImage);

    try {
      const res = await axios.post('http://localhost:5000/api/damage-claims', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data);
      setStep(4);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getVerdictStyle = (verdict) => {
    const styles = {
      delivery_fault: { bg: '#fee2e2', color: '#dc2626', label: t('damage.verdicts.delivery_fault'), icon: '🚚' },
      product_defect: { bg: '#fef3c7', color: '#d97706', label: t('damage.verdicts.product_defect'), icon: '📦' },
      unclear: { bg: '#f1f5f9', color: '#64748b', label: t('damage.verdicts.unclear'), icon: '🔍' },
    };
    return styles[verdict] || styles.unclear;
  };

  const getClaimStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#d97706', label: t('damage.claimStatus.pending') },
      approved: { bg: '#dcfce7', color: '#16a34a', label: t('damage.claimStatus.approved') },
      declined: { bg: '#fee2e2', color: '#dc2626', label: t('damage.claimStatus.declined') },
      under_review: { bg: '#dbeafe', color: '#2563eb', label: t('damage.claimStatus.under_review') },
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
        {s.label}
      </span>
    );
  };

  const stepLabels = [t('damage.step1'), t('damage.step2'), t('damage.step3'), t('damage.step4')];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '80px 20px 40px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '28px', marginBottom: '28px', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px' }}>
            📸 {t('damage.title')}
          </h1>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>{t('damage.subtitle')}</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const active = stepNum === step;
            const done = stepNum < step;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: done ? '#16a34a' : active ? '#2563eb' : '#e2e8f0',
                  color: done || active ? 'white' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '14px', marginBottom: '6px',
                  transition: 'all 0.2s',
                }}>
                  {done ? '✓' : stepNum}
                </div>
                <div style={{ fontSize: '11px', color: active ? '#2563eb' : '#94a3b8', fontWeight: active ? '600' : '400', textAlign: 'center' }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* Step 1: Select Delivery */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              {t('damage.step1title')}
            </h2>
            {deliveries.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>{t('damage.noDeliveries')}</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {deliveries.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDelivery(String(d.id))}
                    style={{
                      border: selectedDelivery === String(d.id) ? '2px solid #2563eb' : '2px solid #e2e8f0',
                      borderRadius: '12px', padding: '16px', cursor: 'pointer',
                      background: selectedDelivery === String(d.id) ? '#eff6ff' : 'white',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      Delivery #{d.id} - {d.receiver_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {d.delivery_address} · {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => { if (!selectedDelivery) { setError(t('damage.selectDelivery')); return; } setError(''); setStep(2); }}
              disabled={!selectedDelivery}
              style={{ marginTop: '20px', width: '100%', background: selectedDelivery ? '#2563eb' : '#93c5fd', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', cursor: selectedDelivery ? 'pointer' : 'not-allowed' }}
            >
              Next: Describe Damage →
            </button>
          </div>
        )}

        {/* Step 2: Describe Damage */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              {t('damage.step2title')}
            </h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('damage.descPlaceholder')}
              rows={6}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {t('damage.back')}
              </button>
              <button
                onClick={() => { if (!description.trim()) { setError(t('damage.describeFirst')); return; } setError(''); setStep(3); }}
                style={{ flex: 2, background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Next: Upload Photos →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Photos */}
        {step === 3 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              {t('damage.step3title')}
            </h2>

            {/* Damage Photos */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '10px', fontSize: '14px' }}>
                {t('damage.damagePhotos')}
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => damageInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#2563eb' : '#cbd5e1'}`,
                  borderRadius: '12px', padding: '32px', textAlign: 'center',
                  cursor: 'pointer', background: dragOver ? '#eff6ff' : '#f8fafc',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📷</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  {t('damage.dragDrop')}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                  {t('damage.photoFormats')}
                </p>
                <input
                  ref={damageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleDamagePhotos(e.target.files)}
                  style={{ display: 'none' }}
                />
              </div>
              {damagePhotoPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                  {damagePhotoPreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={src} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e2e8f0' }} />
                      <button
                        onClick={() => {
                          const newPhotos = damagePhotos.filter((_, idx) => idx !== i);
                          const newPreviews = damagePhotoPreviews.filter((_, idx) => idx !== i);
                          setDamagePhotos(newPhotos);
                          setDamagePhotoPreviews(newPreviews);
                        }}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice Image */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '10px', fontSize: '14px' }}>
                {t('damage.invoice')}
              </label>
              <div
                onClick={() => invoiceInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px', padding: '20px', textAlign: 'center',
                  cursor: 'pointer', background: '#f8fafc',
                }}
              >
                {invoicePreview ? (
                  <img src={invoicePreview} alt="invoice" style={{ maxHeight: '120px', borderRadius: '8px' }} />
                ) : (
                  <>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>🧾</div>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{t('damage.clickInvoice')}</p>
                  </>
                )}
                <input
                  ref={invoiceInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInvoiceImage(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {t('damage.back')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ flex: 2, background: submitting ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? `🤖 ${t('damage.submitting')}` : `🚀 ${t('damage.submit')}`}
              </button>
            </div>

            {submitting && (
              <div style={{ textAlign: 'center', marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
                <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>⚙️</span>
                  {t('damage.analyzing')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && result && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
              🤖 {t('damage.aiComplete')}
            </h2>

            {result.ai_verdict && (() => {
              const vStyle = getVerdictStyle(result.ai_verdict);
              return (
                <div style={{ background: vStyle.bg, borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>{vStyle.icon}</div>
                  <div style={{ fontWeight: 'bold', color: vStyle.color, fontSize: '18px', marginBottom: '4px' }}>
                    {vStyle.label}
                  </div>
                  {result.ai_analysis && (
                    <p style={{ color: '#475569', fontSize: '14px', marginTop: '12px', lineHeight: '1.6', textAlign: 'left' }}>
                      {result.ai_analysis}
                    </p>
                  )}
                </div>
              );
            })()}

            {result.estimated_refund_percent !== undefined && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#166534', fontWeight: '600' }}>{t('damage.estimatedRefund')}</span>
                <span style={{ color: '#16a34a', fontSize: '24px', fontWeight: 'bold' }}>{result.estimated_refund_percent}%</span>
              </div>
            )}

            <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
              <p style={{ color: '#1d4ed8', fontWeight: '600', margin: 0 }}>{t('damage.claimSubmitted')}</p>
              <p style={{ color: '#3b82f6', fontSize: '13px', margin: '4px 0 0' }}>{t('damage.claimHint')}</p>
            </div>

            <button
              onClick={() => { setStep(1); setSelectedDelivery(''); setDescription(''); setDamagePhotos([]); setDamagePhotoPreviews([]); setInvoiceImage(null); setInvoicePreview(null); setResult(null); setError(''); }}
              style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              {t('damage.fileAnother')}
            </button>
          </div>
        )}

        {/* Existing Claims */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>
            📋 {t('damage.previousClaims')}
          </h2>
          {loadingClaims ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('damage.loading')}</div>
          ) : claims.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '14px', padding: '32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: '#94a3b8' }}>
              {t('damage.noClaims')}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {claims.map((claim) => (
                <div key={claim.id} style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>Claim #{claim.id} · Delivery #{claim.delivery_id}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(claim.created_at).toLocaleDateString()}</div>
                    </div>
                    {getClaimStatusBadge(claim.status)}
                  </div>
                  <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{claim.description}</p>
                  {claim.ai_verdict && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                      {t('damage.aiVerdict')}: <strong>{getVerdictStyle(claim.ai_verdict).label}</strong>
                      {claim.estimated_refund_percent !== undefined && ` · ${t('damage.refund')}: ${claim.estimated_refund_percent}%`}
                    </div>
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

export default DamageClaim;
