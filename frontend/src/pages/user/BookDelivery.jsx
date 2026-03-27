import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';

const BookDelivery = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('manual'); // 'manual' | 'bot'

  // Manual form state
  const [form, setForm] = useState({
    sender_name: '', sender_phone: '',
    pickup_address: '', receiver_name: '',
    receiver_phone: '', delivery_address: '',
    package_description: '', delivery_option: 'standard', package_size: 'medium',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('booking.initialMessage') }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Voice agent state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Text-to-Speech for assistant messages
  const speakMessage = (text) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/BOOKING_COMPLETE:[\s\S]*/, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = i18n.language === 'fi' ? 'fi-FI'
      : i18n.language === 'ru' ? 'ru-RU'
      : i18n.language === 'sv' ? 'sv-SE'
      : 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessageWithText = async (text) => {
    if (!text.trim()) return;
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/chatbot/chat',
        { messages: newMessages },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const assistantMessage = res.data.message;
      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);

      if (res.data.bookingData) {
        setBookingData(res.data.bookingData);
      }

      if (res.data.complaintData) {
        try {
          await axios.post(
            'http://localhost:5000/api/complaints',
            res.data.complaintData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (_e) {
          // complaint submission failed silently — user can also use /user/complaints
        }
      }

      speakMessage(assistantMessage);
    } catch (err) {
      const errMsg = t('booking.error');
      setMessages([...newMessages, { role: 'assistant', content: errMsg }]);
      speakMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    await sendMessageWithText(input);
  };

  // Speech Recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = i18n.language === 'fi' ? 'fi-FI'
      : i18n.language === 'ru' ? 'ru-RU'
      : i18n.language === 'sv' ? 'sv-SE'
      : 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-send after recognition
      setTimeout(() => sendMessageWithText(transcript), 500);
    };

    recognition.start();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const confirmBooking = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/deliveries',
        bookingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingConfirmed(true);
      setTimeout(() => navigate('/user/dashboard'), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const submitManualForm = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await axios.post('http://localhost:5000/api/deliveries', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingConfirmed(true);
      setTimeout(() => navigate('/user/dashboard'), 2000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to book delivery. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageStyle = (role) => {
    if (role === 'user') {
      return {
        background: '#2563eb',
        color: 'white',
        borderRadius: '18px 18px 4px 18px',
        padding: '12px 16px',
        maxWidth: '70%',
        marginLeft: 'auto',
        marginBottom: '12px',
        wordBreak: 'break-word'
      };
    }
    return {
      background: 'white',
      color: '#1e293b',
      borderRadius: '18px 18px 18px 4px',
      padding: '12px 16px',
      maxWidth: '70%',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      wordBreak: 'break-word'
    };
  };

  if (bookingConfirmed) {
    return (
      <div style={{minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', background: 'white', padding: '48px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
          <div style={{fontSize: '64px', marginBottom: '16px'}}>✅</div>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px'}}>{t('booking.confirmed')}</h2>
          <p style={{color: '#64748b'}}>{t('booking.redirecting')}</p>
        </div>
      </div>
    );
  }

  const inputStyle = { width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '14px' };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{maxWidth: '800px', margin: '0 auto', padding: '96px 20px 40px'}}>

        {/* Header */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white', textAlign: 'center'}}>
          <div style={{textAlign: 'left'}}><BackButton to="/user/dashboard" /></div>
          <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '4px'}}>📦 {t('booking.title')}</h1>
          <p style={{opacity: 0.8, fontSize: '14px'}}>{t('booking.subtitle')}</p>
        </div>

        {/* Mode Toggle */}
        <div style={{display: 'flex', background: 'white', borderRadius: '12px', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px'}}>
          {[
            { key: 'manual', icon: '📝', label: 'Manual Form' },
            { key: 'bot',    icon: '🤖', label: 'AI Assistant' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              style={{
                flex: 1, border: 'none', borderRadius: '8px', padding: '14px',
                background: mode === opt.key ? '#2563eb' : 'transparent',
                color: mode === opt.key ? 'white' : '#64748b',
                fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* ── MANUAL FORM ── */}
        {mode === 'manual' && (
          <div style={{background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
            <form onSubmit={submitManualForm}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px'}}>

                <div style={{gridColumn: '1/-1'}}>
                  <h3 style={{fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px', fontSize: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px'}}>Sender Details</h3>
                </div>
                <div>
                  <label style={labelStyle}>Sender Name</label>
                  <input required style={inputStyle} value={form.sender_name} onChange={e => setForm({...form, sender_name: e.target.value})} placeholder="Full name" />
                </div>
                <div>
                  <label style={labelStyle}>Sender Phone</label>
                  <input required style={inputStyle} value={form.sender_phone} onChange={e => setForm({...form, sender_phone: e.target.value})} placeholder="+358 ..." />
                </div>
                <div style={{gridColumn: '1/-1'}}>
                  <label style={labelStyle}>Pickup Address</label>
                  <input required style={inputStyle} value={form.pickup_address} onChange={e => setForm({...form, pickup_address: e.target.value})} placeholder="Street, City" />
                </div>

                <div style={{gridColumn: '1/-1', marginTop: '8px'}}>
                  <h3 style={{fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px', fontSize: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px'}}>Receiver Details</h3>
                </div>
                <div>
                  <label style={labelStyle}>Receiver Name</label>
                  <input required style={inputStyle} value={form.receiver_name} onChange={e => setForm({...form, receiver_name: e.target.value})} placeholder="Full name" />
                </div>
                <div>
                  <label style={labelStyle}>Receiver Phone</label>
                  <input required style={inputStyle} value={form.receiver_phone} onChange={e => setForm({...form, receiver_phone: e.target.value})} placeholder="+358 ..." />
                </div>
                <div style={{gridColumn: '1/-1'}}>
                  <label style={labelStyle}>Delivery Address</label>
                  <input required style={inputStyle} value={form.delivery_address} onChange={e => setForm({...form, delivery_address: e.target.value})} placeholder="Street, City" />
                </div>

                <div style={{gridColumn: '1/-1', marginTop: '8px'}}>
                  <h3 style={{fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px', fontSize: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px'}}>Package Details</h3>
                </div>
                <div>
                  <label style={labelStyle}>Delivery Option</label>
                  <select style={inputStyle} value={form.delivery_option} onChange={e => setForm({...form, delivery_option: e.target.value})}>
                    <option value="standard">Standard (2-3 days) — from €4.99</option>
                    <option value="express">Express (next day) — from €9.99</option>
                    <option value="same_day">Same Day — from €19.99</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Package Size</label>
                  <select style={inputStyle} value={form.package_size} onChange={e => setForm({...form, package_size: e.target.value})}>
                    <option value="xs">XS — under 1 kg</option>
                    <option value="small">Small — 1–5 kg</option>
                    <option value="medium">Medium — 5–15 kg</option>
                    <option value="large">Large — 15–30 kg</option>
                    <option value="xl">XL — 30 kg+</option>
                  </select>
                </div>
                <div style={{gridColumn: '1/-1'}}>
                  <label style={labelStyle}>Package Description <span style={{color:'#94a3b8', fontWeight:'400'}}>(optional)</span></label>
                  <textarea rows={3} style={{...inputStyle, resize: 'vertical'}} value={form.package_description} onChange={e => setForm({...form, package_description: e.target.value})} placeholder="e.g. Fragile electronics, documents..." />
                </div>

                {formError && (
                  <div style={{gridColumn: '1/-1', background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px'}}>
                    {formError}
                  </div>
                )}

                <div style={{gridColumn: '1/-1'}}>
                  <button
                    type="submit"
                    disabled={formLoading}
                    style={{width: '100%', background: formLoading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '600', fontSize: '15px', cursor: formLoading ? 'not-allowed' : 'pointer'}}
                  >
                    {formLoading ? '⏳ Booking...' : '📦 Confirm Booking'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── BOT MODE ── */}
        {mode === 'bot' && (<>

        {/* Voice Mode Controls */}
        <div style={{background: 'white', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <button
              onClick={toggleVoice}
              style={{
                background: voiceEnabled ? '#1d4ed8' : '#f1f5f9',
                color: voiceEnabled ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 18px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              🎙️ Voice Mode {voiceEnabled ? 'ON' : 'OFF'}
            </button>

            {isSpeaking && (
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontSize: '13px', fontWeight: '600'}}>
                <span style={{animation: 'pulse 1s infinite'}}>🔊</span>
                Speaking...
              </div>
            )}
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b'}}>
            <span>Language:</span>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', outline: 'none'}}
            >
              <option value="en">🇬🇧 English</option>
              <option value="fi">🇫🇮 Finnish</option>
              <option value="sv">🇸🇪 Swedish</option>
              <option value="ru">🇷🇺 Russian</option>
            </select>
          </div>
        </div>

        {/* Chat window */}
        <div style={{background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden'}}>

          {/* Messages */}
          <div style={{padding: '24px', height: '400px', overflowY: 'auto', background: '#f8fafc'}}>
            {messages.map((msg, index) => (
              <div key={index} style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{fontSize: '11px', color: '#94a3b8', marginBottom: '4px', textAlign: msg.role === 'user' ? 'right' : 'left'}}>
                  {msg.role === 'user' ? `👤 ${t('booking.you')}` : `🤖 ${t('booking.assistant')}`}
                </div>
                <div style={getMessageStyle(msg.role)}>
                  {msg.content.replace(/BOOKING_COMPLETE:[\s\S]*/, '').trim()}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8'}}>
                <div style={{background: 'white', borderRadius: '18px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
                  ⏳ {t('booking.typing')}
                </div>
              </div>
            )}
          </div>

          {/* Booking summary */}
          {bookingData && (
            <div style={{background: '#f0fdf4', border: '1px solid #86efac', margin: '0 24px 16px', borderRadius: '12px', padding: '20px'}}>
              <h3 style={{fontWeight: 'bold', color: '#166534', marginBottom: '12px'}}>📋 {t('booking.summary')}</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px', fontSize: '14px'}}>
                <div><span style={{color: '#64748b'}}>{t('booking.sender')}:</span> <strong>{bookingData.sender_name}</strong></div>
                <div><span style={{color: '#64748b'}}>{t('booking.phone')}:</span> <strong>{bookingData.sender_phone}</strong></div>
                <div><span style={{color: '#64748b'}}>{t('booking.pickup')}:</span> <strong>{bookingData.pickup_address}</strong></div>
                <div><span style={{color: '#64748b'}}>{t('booking.receiver')}:</span> <strong>{bookingData.receiver_name}</strong></div>
                <div><span style={{color: '#64748b'}}>{t('booking.phone')}:</span> <strong>{bookingData.receiver_phone}</strong></div>
                <div><span style={{color: '#64748b'}}>{t('booking.delivery')}:</span> <strong>{bookingData.delivery_address}</strong></div>
                {bookingData.package_description && (
                  <div style={{gridColumn: '1/-1'}}><span style={{color: '#64748b'}}>{t('booking.package')}:</span> <strong>{bookingData.package_description}</strong></div>
                )}
              </div>
              <button
                onClick={confirmBooking}
                style={{marginTop: '16px', background: '#16a34a', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', width: '100%', fontSize: '16px'}}
              >
                ✅ {t('booking.confirm')}
              </button>
            </div>
          )}

          {/* Input area */}
          <div style={{padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center'}}>
            {voiceEnabled ? (
              /* Voice input mode */
              <>
                <div style={{flex: 1, color: '#64748b', fontSize: '14px', padding: '12px 16px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0'}}>
                  {input || (isListening ? '🎙️ Listening...' : 'Press mic to speak')}
                </div>
                <button
                  onClick={startListening}
                  disabled={isListening || loading}
                  style={{
                    width: '50px', height: '50px',
                    background: isListening ? '#ef4444' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: isListening || loading ? 'not-allowed' : 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: isListening ? 'pulse 1s infinite' : 'none',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  🎙️
                </button>
              </>
            ) : (
              /* Text input mode */
              <>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('booking.chatPlaceholder')}
                  style={{flex: 1, border: '1px solid #e2e8f0', borderRadius: '24px', padding: '12px 20px', outline: 'none', fontSize: '14px'}}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{background: '#2563eb', color: 'white', border: 'none', borderRadius: '24px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer', opacity: loading || !input.trim() ? 0.5 : 1}}
                >
                  {t('booking.send')}
                </button>
              </>
            )}
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
        </>)}

      </div>
    </div>
  );
};

export default BookDelivery;
