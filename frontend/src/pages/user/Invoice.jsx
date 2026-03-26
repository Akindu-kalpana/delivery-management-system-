import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Invoice = () => {
  const { id: deliveryId } = useParams();
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [deliveryId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/deliveries/${deliveryId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoice(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invoice not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById('invoice-content');
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(`invoice-${deliveryId}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-FI', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '€0.00';
    return `€${Number(val).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
            Loading invoice...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ maxWidth: '700px', margin: '80px auto 0', padding: '20px' }}>
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>❌</div>
            <p style={{ fontWeight: '600', margin: 0 }}>{error}</p>
          </div>
          <button onClick={() => navigate(-1)} style={{ marginTop: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', cursor: 'pointer', fontWeight: '600' }}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const delivery = invoice?.delivery || invoice || {};
  const pricing = invoice?.pricing || {};

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '96px 20px 40px' }}>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{ background: downloading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: '600', cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {downloading ? '⏳ Generating PDF...' : '📥 Download PDF'}
          </button>
        </div>

        {/* Invoice Content */}
        <div
          id="invoice-content"
          style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', padding: '36px 40px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                    🚚
                  </div>
                  <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>NKR Delivery</h1>
                    <p style={{ opacity: 0.8, fontSize: '12px', margin: 0 }}>Fast & Reliable Delivery in Finland</p>
                  </div>
                </div>
                <p style={{ opacity: 0.7, fontSize: '12px', marginTop: '8px' }}>
                  Aleksanterinkatu 1, 90100 Oulu, Finland<br />
                  info@nkrdelivery.fi · +358 44 123 4567
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 20px' }}>
                  <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Invoice</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold' }}>#{delivery.id || deliveryId}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                    {formatDate(delivery.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '36px 40px' }}>
            {/* From / To */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  From (Sender)
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px', marginBottom: '6px' }}>
                    {delivery.sender_name || 'N/A'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                    {delivery.sender_phone || ''}<br />
                    {delivery.pickup_address || ''}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  To (Receiver)
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px', marginBottom: '6px' }}>
                    {delivery.receiver_name || 'N/A'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                    {delivery.receiver_phone || ''}<br />
                    {delivery.delivery_address || ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontWeight: '700', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Delivery Details
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    {[
                      { label: 'Delivery Option', value: delivery.delivery_option ? delivery.delivery_option.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Standard' },
                      { label: 'Package Size', value: delivery.package_size ? delivery.package_size.replace(/\b\w/g, c => c.toUpperCase()) : 'N/A' },
                      { label: 'Package Description', value: delivery.package_description || 'N/A' },
                      { label: 'Status', value: delivery.status ? delivery.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'N/A' },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '500', width: '40%' }}>{row.label}</td>
                        <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '600' }}>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontWeight: '700', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Price Breakdown
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                {[
                  { label: 'Base Price', value: pricing.base_price || delivery.base_price },
                  { label: 'Size Surcharge', value: pricing.size_surcharge || delivery.size_surcharge },
                  { label: 'Weight Surcharge', value: pricing.weight_surcharge || delivery.weight_surcharge },
                  { label: 'Option Surcharge', value: pricing.option_surcharge || delivery.option_surcharge },
                ].filter(r => r.value !== undefined && r.value !== null).map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>{row.label}</span>
                    <span style={{ color: '#1e293b', fontWeight: '500' }}>{formatCurrency(row.value)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 18px', background: '#1d4ed8' }}>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>Total</span>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '20px' }}>
                    {formatCurrency(pricing.total_price || delivery.total_price || delivery.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Loyalty Points */}
            {(delivery.loyalty_points_earned || pricing.loyalty_points_earned) && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontSize: '24px' }}>⭐</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#92400e' }}>Loyalty Points Earned</div>
                  <div style={{ color: '#d97706', fontSize: '20px', fontWeight: 'bold' }}>
                    +{delivery.loyalty_points_earned || pricing.loyalty_points_earned} points
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                Thank you for choosing NKR Delivery! For any questions about this invoice, contact us at info@nkrdelivery.fi
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '11px', marginTop: '8px' }}>
                NKR Delivery Oy · VAT: FI12345678 · Business ID: 1234567-8
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
