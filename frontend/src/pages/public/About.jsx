import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '64px'}}>

        {/* Hero */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '80px 20px', textAlign: 'center', color: 'white'}}>
          <h1 style={{fontSize: '42px', fontWeight: 'bold', marginBottom: '16px'}}>About Us</h1>
          <p style={{fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto'}}>
            We are Nopeiden Kuljetusten Ritarit AY — a Finnish delivery company committed to fast, reliable, and accessible logistics.
          </p>
        </div>

        {/* Story */}
        <div style={{maxWidth: '900px', margin: '0 auto', padding: '60px 20px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center'}}>
            <div>
              <h2 style={{fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px'}}>Our Story</h2>
              <p style={{color: '#64748b', lineHeight: '1.8', marginBottom: '16px'}}>
                Nopeiden Kuljetusten Ritarit AY was founded with a simple mission — to make delivery services fast, affordable, and accessible to everyone in Finland.
              </p>
              <p style={{color: '#64748b', lineHeight: '1.8', marginBottom: '16px'}}>
                We believe that booking a delivery should be as easy as having a conversation. That is why we built Finland's first AI-powered delivery booking system that supports English, Finnish, and Russian.
              </p>
              <p style={{color: '#64748b', lineHeight: '1.8'}}>
                Whether you are sending a small package across the city or managing multiple deliveries for your business, we have got you covered.
              </p>
            </div>
            <div style={{textAlign: 'center', fontSize: '120px'}}>🚚</div>
          </div>
        </div>

        {/* Values */}
        <div style={{background: 'white', padding: '60px 20px'}}>
          <div style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 style={{fontSize: '32px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: '48px'}}>Our Values</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px'}}>
              {[
                { icon: '⚡', title: 'Speed', desc: 'We move fast so your packages arrive on time, every time.' },
                { icon: '🤝', title: 'Reliability', desc: 'You can count on us to handle your deliveries with care and professionalism.' },
                { icon: '🌍', title: 'Accessibility', desc: 'We serve everyone — in English, Finnish, and Russian.' },
                { icon: '🔒', title: 'Security', desc: 'Your data and packages are always safe with us.' },
              ].map((value, index) => (
                <div key={index} style={{textAlign: 'center', padding: '32px', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#f8fafc'}}>
                  <div style={{fontSize: '48px', marginBottom: '16px'}}>{value.icon}</div>
                  <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px'}}>{value.title}</h3>
                  <p style={{color: '#64748b', lineHeight: '1.6'}}>{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '60px 20px', textAlign: 'center', color: 'white'}}>
          <h2 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '16px'}}>Ready to Ship?</h2>
          <p style={{opacity: 0.8, marginBottom: '32px', fontSize: '18px'}}>Join us today and experience delivery the modern way.</p>
          <Link to="/register" style={{background: 'white', color: '#1d4ed8', padding: '14px 32px', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none'}}>
            Get Started
          </Link>
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

export default About;