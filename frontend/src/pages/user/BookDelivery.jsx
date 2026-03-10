import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const BookDelivery = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your delivery booking assistant. I will help you book a delivery. Shall we get started?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/chatbot/chat',
        { messages: newMessages },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...newMessages, { role: 'assistant', content: res.data.message }]);

      if (res.data.bookingData) {
        setBookingData(res.data.bookingData);
      }

    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
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

  const handleKeyPress = (e) => {
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
          <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px'}}>Booking Confirmed!</h2>
          <p style={{color: '#64748b'}}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '80px', maxWidth: '800px', margin: '0 auto', padding: '80px 20px 40px'}}>
        
        {/* Header */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white', textAlign: 'center'}}>
          <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '4px'}}>🤖 {t('booking.title')}</h1>
          <p style={{opacity: 0.8, fontSize: '14px'}}>Chat with our AI assistant to book your delivery</p>
        </div>

        {/* Chat window */}
        <div style={{background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden'}}>
          
          {/* Messages */}
          <div style={{padding: '24px', height: '400px', overflowY: 'auto', background: '#f8fafc'}}>
            {messages.map((msg, index) => (
              <div key={index} style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{fontSize: '11px', color: '#94a3b8', marginBottom: '4px', textAlign: msg.role === 'user' ? 'right' : 'left'}}>
                  {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
                </div>
                <div style={getMessageStyle(msg.role)}>
                  {msg.content.replace(/BOOKING_COMPLETE:[\s\S]*/, '').trim()}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8'}}>
                <div style={{background: 'white', borderRadius: '18px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
                  ⏳ Typing...
                </div>
              </div>
            )}
          </div>

          {/* Booking summary */}
          {bookingData && (
            <div style={{background: '#f0fdf4', border: '1px solid #86efac', margin: '0 24px 16px', borderRadius: '12px', padding: '20px'}}>
              <h3 style={{fontWeight: 'bold', color: '#166534', marginBottom: '12px'}}>📋 Booking Summary</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px'}}>
                <div><span style={{color: '#64748b'}}>Sender:</span> <strong>{bookingData.sender_name}</strong></div>
                <div><span style={{color: '#64748b'}}>Phone:</span> <strong>{bookingData.sender_phone}</strong></div>
                <div><span style={{color: '#64748b'}}>Pickup:</span> <strong>{bookingData.pickup_address}</strong></div>
                <div><span style={{color: '#64748b'}}>Receiver:</span> <strong>{bookingData.receiver_name}</strong></div>
                <div><span style={{color: '#64748b'}}>Phone:</span> <strong>{bookingData.receiver_phone}</strong></div>
                <div><span style={{color: '#64748b'}}>Delivery:</span> <strong>{bookingData.delivery_address}</strong></div>
                {bookingData.package_description && (
                  <div style={{gridColumn: '1/-1'}}><span style={{color: '#64748b'}}>Package:</span> <strong>{bookingData.package_description}</strong></div>
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
          <div style={{padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px'}}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDelivery;