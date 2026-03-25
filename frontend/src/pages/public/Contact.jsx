import { useState } from 'react';
import Navbar from '../../components/Navbar';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '64px'}}>

        {/* Hero */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '80px 20px', textAlign: 'center', color: 'white'}}>
          <h1 style={{fontSize: '42px', fontWeight: 'bold', marginBottom: '16px'}}>Contact Us</h1>
          <p style={{fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto'}}>
            Have a question or need help? We are here for you.
          </p>
        </div>

        <div style={{maxWidth: '1000px', margin: '0 auto', padding: '60px 20px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px'}}>

            {/* Contact info */}
            <div>
              <h2 style={{fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '32px'}}>Get in Touch</h2>
              {[
                { icon: '📍', title: 'Address', value: 'Kajaaninkatu 1, 90100 Oulu, Finland' },
                { icon: '📞', title: 'Phone', value: '+358 40 123 4567' },
                { icon: '📧', title: 'Email', value: 'info@nkrdelivery.fi' },
                { icon: '🕐', title: 'Working Hours', value: 'Mon - Fri: 8:00 - 18:00' },
              ].map((item, index) => (
                <div key={index} style={{display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px'}}>
                  <div style={{fontSize: '32px'}}>{item.icon}</div>
                  <div>
                    <div style={{fontWeight: '600', color: '#1e293b', marginBottom: '4px'}}>{item.title}</div>
                    <div style={{color: '#64748b'}}>{item.value}</div>
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div style={{background: '#e2e8f0', borderRadius: '16px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '32px'}}>
                <div style={{textAlign: 'center', color: '#64748b'}}>
                  <div style={{fontSize: '48px', marginBottom: '8px'}}>🗺️</div>
                  <div>Oulu, Finland</div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div style={{background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
              {submitted ? (
                <div style={{textAlign: 'center', padding: '40px'}}>
                  <div style={{fontSize: '64px', marginBottom: '16px'}}>✅</div>
                  <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px'}}>Message Sent!</h3>
                  <p style={{color: '#64748b'}}>We will get back to you as soon as possible.</p>
                </div>
              ) : (
                <>
                  <h3 style={{fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px'}}>Send a Message</h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <div>
                      <label style={{display: 'block', fontWeight: '600', color: '#475569', marginBottom: '6px', fontSize: '14px'}}>Your Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Smith"
                        style={{width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', fontWeight: '600', color: '#475569', marginBottom: '6px', fontSize: '14px'}}>Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="you@example.com"
                        style={{width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', fontWeight: '600', color: '#475569', marginBottom: '6px', fontSize: '14px'}}>Subject</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="How can we help?"
                        style={{width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', fontWeight: '600', color: '#475569', marginBottom: '6px', fontSize: '14px'}}>Message</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Write your message here..."
                        rows={5}
                        style={{width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box'}}
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      style={{background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: '600', fontSize: '16px', cursor: 'pointer'}}
                    >
                      Send Message
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
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

export default Contact;