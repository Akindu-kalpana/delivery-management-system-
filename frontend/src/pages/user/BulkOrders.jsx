import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const EXAMPLE_CSV = `sender_name,sender_phone,pickup_address,receiver_name,receiver_phone,delivery_address,delivery_option,package_size
John Doe,+358401234567,Kauppurienkatu 25 Oulu,Jane Smith,+358409876543,Mannerheimintie 1 Helsinki,standard,small
Acme Corp,+35890123456,Teknologiantie 10 Oulu,Bob Johnson,+35891234567,Aleksanterinkatu 20 Tampere,express,medium`;

const COLUMNS = [
  { key: 'sender_name', label: 'Sender Name' },
  { key: 'sender_phone', label: 'Sender Phone' },
  { key: 'pickup_address', label: 'Pickup Address' },
  { key: 'receiver_name', label: 'Receiver Name' },
  { key: 'receiver_phone', label: 'Receiver Phone' },
  { key: 'delivery_address', label: 'Delivery Address' },
  { key: 'delivery_option', label: 'Option' },
  { key: 'package_size', label: 'Size' },
];

const emptyRow = () => ({
  sender_name: '', sender_phone: '', pickup_address: '',
  receiver_name: '', receiver_phone: '', delivery_address: '',
  delivery_option: 'standard', package_size: 'small',
});

const BulkOrders = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [step, setStep] = useState(1);
  const [rawContent, setRawContent] = useState('');
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [bulkOrderId, setBulkOrderId] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setRawContent(ev.target.result);
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    if (!rawContent.trim()) {
      setError('Please provide CSV data or paste your order data.');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/bulk/process',
        { raw_content: rawContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRows(res.data.extracted_deliveries || []);
      setBulkOrderId(res.data.bulk_order?.id || null);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process data. Please check the format and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCellChange = (rowIndex, key, value) => {
    const updated = rows.map((row, i) => i === rowIndex ? { ...row, [key]: value } : row);
    setRows(updated);
  };

  const handleAddRow = () => {
    setRows([...rows, emptyRow()]);
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setError('');
    try {
      const res = await axios.post(
        `http://localhost:5000/api/bulk/confirm/${bulkOrderId}`,
        { deliveries: rows },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfirmed(res.data);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm orders. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const stepLabels = [t('bulkOrders.step1'), t('bulkOrders.step2'), t('bulkOrders.step3'), t('bulkOrders.step4')];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 20px 40px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '28px', marginBottom: '28px', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px' }}>
            📦 {t('bulkOrders.title')}
          </h1>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>{t('bulkOrders.subtitle')}</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {stepLabels.map((label, i) => {
            const sn = i + 1;
            const active = sn === step;
            const done = sn < step;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: done ? '#16a34a' : active ? '#2563eb' : '#e2e8f0', color: done || active ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>
                  {done ? '✓' : sn}
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

        {/* Step 1: Upload */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              {t('bulkOrders.step1title')}
            </h2>

            {/* Example format */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '600', color: '#374151', fontSize: '13px', marginBottom: '10px' }}>📋 {t('bulkOrders.exampleFormat')}</div>
              <pre style={{ fontSize: '12px', color: '#475569', overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{EXAMPLE_CSV}</pre>
              <button
                onClick={() => setRawContent(EXAMPLE_CSV)}
                style={{ marginTop: '10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                {t('bulkOrders.useExample')}
              </button>
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px', fontSize: '14px' }}>
                {t('bulkOrders.uploadFile')}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📂</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{t('bulkOrders.clickUpload')}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.xlsx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>{t('bulkOrders.or')}</div>

            {/* Paste Area */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px', fontSize: '14px' }}>
                {t('bulkOrders.pasteData')}
              </label>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="Paste your CSV data or order information here..."
                rows={8}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'monospace' }}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!rawContent.trim()}
              style={{ marginTop: '20px', width: '100%', background: rawContent.trim() ? '#2563eb' : '#93c5fd', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', cursor: rawContent.trim() ? 'pointer' : 'not-allowed' }}
            >
              {t('bulkOrders.next')}
            </button>
          </div>
        )}

        {/* Step 2: Process */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              {t('bulkOrders.step2title')}
            </h2>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <p style={{ color: '#475569', fontSize: '15px', marginBottom: '28px' }}>
              Our AI will extract and validate all delivery information from your data.
            </p>

            {processing ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb', animation: `bounce${i} 0.8s infinite alternate`, animationDelay: `${i * 0.2}s`, opacity: 0.7 }} />
                  ))}
                </div>
                <p style={{ color: '#2563eb', fontWeight: '600' }}>{t('bulkOrders.processing')}</p>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>{t('bulkOrders.processingHint')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setStep(1)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', padding: '14px 28px', fontWeight: '600', cursor: 'pointer' }}>
                  {t('bulkOrders.back')}
                </button>
                <button
                  onClick={handleProcess}
                  style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '14px 36px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}
                >
                  🤖 {t('bulkOrders.processBtn')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review Table */}
        {step === 3 && (
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                  {t('bulkOrders.step3title')} ({rows.length} orders)
                </h2>
                <button
                  onClick={handleAddRow}
                  style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  {t('bulkOrders.addRow')}
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {COLUMNS.map(col => (
                        <th key={col.key} style={{ padding: '10px 8px', textAlign: 'left', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                          {col.label}
                        </th>
                      ))}
                      <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #e2e8f0' }}>Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => (
                      <tr key={rowIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {COLUMNS.map(col => (
                          <td key={col.key} style={{ padding: '6px 4px' }}>
                            {col.key === 'delivery_option' ? (
                              <select
                                value={row[col.key] || 'standard'}
                                onChange={(e) => handleCellChange(rowIdx, col.key, e.target.value)}
                                style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 6px', fontSize: '12px', width: '100%' }}
                              >
                                <option value="standard">Standard</option>
                                <option value="express">Express</option>
                                <option value="same_day">Same Day</option>
                              </select>
                            ) : col.key === 'package_size' ? (
                              <select
                                value={row[col.key] || 'small'}
                                onChange={(e) => handleCellChange(rowIdx, col.key, e.target.value)}
                                style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 6px', fontSize: '12px', width: '100%' }}
                              >
                                <option value="xs">XS</option>
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="xl">XL</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={row[col.key] || ''}
                                onChange={(e) => handleCellChange(rowIdx, col.key, e.target.value)}
                                style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 8px', fontSize: '12px', width: '100%', minWidth: '100px', boxSizing: 'border-box' }}
                              />
                            )}
                          </td>
                        ))}
                        <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRemoveRow(rowIdx)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {t('bulkOrders.back')}
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirming || rows.length === 0}
                style={{ flex: 2, background: confirming || rows.length === 0 ? '#93c5fd' : '#16a34a', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', cursor: confirming || rows.length === 0 ? 'not-allowed' : 'pointer', fontSize: '15px' }}
              >
                {confirming ? `⏳ ${t('bulkOrders.confirming')}` : `✅ ${t('bulkOrders.confirmBtn')} (${rows.length})`}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && confirmed && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
              {t('bulkOrders.successTitle')}
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '8px' }}>
              <strong style={{ color: '#16a34a' }}>{confirmed.count || confirmed.deliveries_created || rows.length}</strong> {t('bulkOrders.successDesc')}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>
              {t('bulkOrders.successHint')}
            </p>
            <button
              onClick={() => { setStep(1); setRawContent(''); setRows([]); setBulkOrderId(null); setConfirmed(null); setError(''); }}
              style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '14px 36px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}
            >
              {t('bulkOrders.createAnother')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkOrders;
