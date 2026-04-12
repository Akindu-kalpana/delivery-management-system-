import API_URL from '../../api.js';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';

const Complaints = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('file');
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [claudeResult, setClaudeResult] = useState(null);

  const [form, setForm] = useState({ delivery_id: '', type: 'late_delivery', description: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'mine') fetchComplaints();
  }, [activeTab]);

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const res = await axios.get(`${API_URL}/api/complaints/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data.complaints || []);
    } catch {
      setError('Failed to load complaints.');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const valid = files.filter(f => validTypes.includes(f.type));
    setImages(valid);
    setPreviews(valid.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    const newImgs = images.filter((_, idx) => idx !== i);
    const newPrevs = previews.filter((_, idx) => idx !== i);
    setImages(newImgs);
    setPreviews(newPrevs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setClaudeResult(null);

    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('description', form.description);
      if (form.delivery_id) formData.append('delivery_id', form.delivery_id);
      images.forEach(img => formData.append('images', img));

      const res = await axios.post(`${API_URL}/api/complaints`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Your complaint has been submitted and reviewed by our AI. We will notify you shortly.');
      setClaudeResult(res.data.claude_review);
      setForm({ delivery_id: '', type: 'late_delivery', description: '' });
      setImages([]);
      setPreviews([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open:      { background: '#fef3c7', color: '#d97706', label: t('complaints.status.open') },
      in_review: { background: '#dbeafe', color: '#2563eb', label: t('complaints.status.in_review') },
      resolved:  { background: '#dcfce7', color: '#16a34a', label: t('complaints.status.resolved') },
      closed:    { background: '#f1f5f9', color: '#64748b', label: t('complaints.status.closed') },
    };
    const s = styles[status] || styles.open;
    return (
      <span style={{ background: s.background, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
        {s.label}
      </span>
    );
  };

  const getRefundBadge = (status) => {
    if (!status) return null;
    const map = {
      pending:  { bg: '#fef3c7', color: '#d97706', label: '⏳ Refund Pending Admin Approval' },
      approved: { bg: '#dcfce7', color: '#16a34a', label: '✅ Refund Approved' },
      declined: { bg: '#fee2e2', color: '#dc2626', label: '❌ Refund Declined' },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
        {s.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const labels = {
      late_delivery: t('complaints.types.late_delivery'),
      damage: t('complaints.types.damage'),
      lost_package: t('complaints.types.lost_package'),
      wrong_address: t('complaints.types.wrong_address'),
      other: t('complaints.types.other'),
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => ({ late_delivery: '⏰', damage: '💔', lost_package: '🔍', wrong_address: '📍', other: '❓' }[type] || '❓');

  const inputStyle = { width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '14px' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '96px 20px 40px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '28px', marginBottom: '28px', color: 'white', textAlign: 'center' }}>
          <div style={{textAlign: 'left'}}><BackButton /></div>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px' }}>📣 {t('complaints.title')}</h1>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>{t('complaints.subtitle')}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          {[{ key: 'file', label: `📝 ${t('complaints.fileTab')}` }, { key: 'mine', label: `📋 ${t('complaints.myTab')}` }].map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setError(''); setSuccess(''); setClaudeResult(null); }}
              style={{ flex: 1, background: activeTab === tab.key ? '#2563eb' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>✅ {success}</div>}

        {/* Claude AI Review Result */}
        {claudeResult && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px', border: '2px solid #e0e7ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '28px' }}>🤖</div>
              <div>
                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>AI Review Complete</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Powered by Claude Vision</div>
              </div>
            </div>

            {/* Validity */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ background: claudeResult.valid ? '#dcfce7' : '#fee2e2', color: claudeResult.valid ? '#16a34a' : '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                {claudeResult.valid ? '✅ Claim Valid' : '❌ Claim Disputed'}
              </span>
              {claudeResult.refund_recommended ? (
                <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  💰 Refund Recommended: €{parseFloat(claudeResult.refund_amount || 0).toFixed(2)}
                </span>
              ) : (
                <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  No Refund Recommended
                </span>
              )}
            </div>

            {/* Summary */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', color: '#374151', fontSize: '13px', marginBottom: '6px' }}>AI Summary</div>
              <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{claudeResult.summary}</p>
            </div>

            {/* Reason */}
            {claudeResult.reason && (
              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontWeight: '600', color: '#1d4ed8', fontSize: '13px', marginBottom: '6px' }}>Policy Assessment</div>
                <p style={{ color: '#1e40af', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{claudeResult.reason}</p>
              </div>
            )}

            {claudeResult.refund_recommended && (
              <div style={{ background: '#fef9c3', borderRadius: '10px', padding: '12px', marginTop: '12px', textAlign: 'center' }}>
                <div style={{ fontWeight: '600', color: '#854d0e', fontSize: '13px' }}>
                  ⏳ A refund invoice of €{parseFloat(claudeResult.refund_amount || 0).toFixed(2)} has been sent to admin for approval
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Complaint Tab */}
        {activeTab === 'file' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>{t('complaints.fileTitle')}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '18px' }}>

                <div>
                  <label style={labelStyle}>{t('complaints.deliveryId')}</label>
                  <input type="number" value={form.delivery_id} onChange={e => setForm({ ...form, delivery_id: e.target.value })}
                    placeholder="Enter delivery ID if applicable" style={inputStyle} />
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>{t('complaints.deliveryIdHint')}</p>
                </div>

                <div>
                  <label style={labelStyle}>{t('complaints.type')}</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required style={inputStyle}>
                    <option value="late_delivery">⏰ {t('complaints.types.late_delivery')}</option>
                    <option value="damage">💔 {t('complaints.types.damage')}</option>
                    <option value="lost_package">🔍 {t('complaints.types.lost_package')}</option>
                    <option value="wrong_address">📍 {t('complaints.types.wrong_address')}</option>
                    <option value="other">❓ {t('complaints.types.other')}</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>{t('complaints.description')}</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder={t('complaints.descPlaceholder')} required rows={4}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                </div>

                {/* Image Upload */}
                <div>
                  <label style={labelStyle}>📷 Evidence Photos <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '13px' }}>(optional, up to 5 images — helps AI assess your claim)</span></label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Click to upload photos</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>JPG, PNG, WEBP — max 10MB each</div>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handleImageChange} />
                  </div>

                  {/* Previews */}
                  {previews.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                      {previews.map((src, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={src} alt="" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e2e8f0' }} />
                          <button type="button" onClick={() => removeImage(i)}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI notice */}
                <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '20px' }}>🤖</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1d4ed8', fontSize: '13px', marginBottom: '4px' }}>AI-Powered Review</div>
                    <div style={{ color: '#1e40af', fontSize: '12px', lineHeight: '1.5' }}>
                      Your complaint and photos will be reviewed by Claude Vision AI. Based on our refund policy, it will assess your claim and generate an invoice for admin approval if a refund is warranted.
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  style={{ background: submitting ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? `🤖 Analyzing with AI...` : `📤 ${t('complaints.submit')}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Complaints Tab */}
        {activeTab === 'mine' && (
          <div>
            {loadingComplaints ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>Loading complaints...
              </div>
            ) : complaints.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <p style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>{t('complaints.noComplaints')}</p>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>{t('complaints.noComplaintsHint')}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {complaints.map(c => {
                  let review = null;
                  try { if (c.claude_review) review = JSON.parse(c.claude_review); } catch {}
                  return (
                    <div key={c.id} style={{ background: 'white', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px', marginBottom: '4px' }}>
                            {getTypeIcon(c.type)} {getTypeLabel(c.type)}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                            Complaint #{c.id} {c.delivery_id ? `· Delivery #${c.delivery_id}` : ''} · {new Date(c.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                          {getStatusBadge(c.status)}
                          {getRefundBadge(c.refund_status)}
                        </div>
                      </div>

                      <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>{c.description}</p>

                      {/* Image count */}
                      {c.image_paths && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                          📷 {JSON.parse(c.image_paths).length} photo(s) submitted
                        </div>
                      )}

                      {/* Claude review summary */}
                      {review && (
                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                          <div style={{ fontWeight: '600', color: '#0369a1', fontSize: '12px', marginBottom: '6px' }}>🤖 AI Review</div>
                          <p style={{ color: '#0c4a6e', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{review.summary}</p>
                          {review.refund_recommended && (
                            <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '600', color: '#d97706' }}>
                              💰 Refund recommended: €{parseFloat(review.refund_amount || 0).toFixed(2)}
                              {c.refund_status && <span style={{ marginLeft: '8px' }}>— {c.refund_status === 'approved' ? '✅ Approved by admin' : c.refund_status === 'declined' ? '❌ Declined by admin' : '⏳ Awaiting admin'}</span>}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admin response */}
                      {c.admin_response && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                          <div style={{ fontWeight: '600', color: '#16a34a', fontSize: '13px', marginBottom: '4px' }}>{t('complaints.adminResponse')}</div>
                          <p style={{ color: '#166534', fontSize: '13px', margin: 0 }}>{c.admin_response}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
