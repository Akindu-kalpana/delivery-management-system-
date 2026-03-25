import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '64px'}}>

        {/* Hero */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '80px 20px', textAlign: 'center', color: 'white'}}>
          <h1 style={{fontSize: '42px', fontWeight: 'bold', marginBottom: '16px'}}>Our Services</h1>
          <p style={{fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto'}}>
            Everything you need for fast and reliable delivery management in Finland
          </p>
        </div>

        {/* Services */}
        <div style={{maxWidth: '1000px', margin: '0 auto', padding: '60px 20px'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px'}}>
            {[
              { icon: '🤖', title: 'AI-Powered Booking', desc: 'Book your delivery by simply chatting with our AI assistant. No forms, no complicated steps. Just tell us what you need and we handle the rest.', color: '#2563eb' },
              { icon: '📍', title: 'Real-Time Tracking', desc: 'Track your delivery from pickup to delivery in real time. Always know where your package is with live status updates.', color: '#7c3aed' },
              { icon: '🌍', title: 'Multilingual Support', desc: 'Our system supports English, Finnish, and Russian. Switch languages anytime and interact with the chatbot in your preferred language.', color: '#059669' },
              { icon: '🚚', title: 'Same Day Delivery', desc: 'Need it fast? We offer same day delivery options for urgent packages within the city.', color: '#dc2626' },
              { icon: '📦', title: 'Package Management', desc: 'Manage all your deliveries from one place. View history, track status, and manage your bookings easily.', color: '#d97706' },
              { icon: '🔒', title: 'Secure & Reliable', desc: 'Your data is protected with industry standard security. Role-based access ensures only the right people see the right information.', color: '#0891b2' },
            ].map((service, index) => (
              <div key={index} style={{background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${service.color}`}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>{service.icon}</div>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px'}}>{service.title}</h3>
                <p style={{color: '#64748b', lineHeight: '1.7'}}>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div style={{background: 'white', padding: '60px 20px'}}>
          <div style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 style={{fontSize: '32px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: '8px'}}>Simple Pricing</h2>
            <p style={{textAlign: 'center', color: '#64748b', marginBottom: '48px'}}>No hidden fees. Pay only for what you use.</p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px'}}>
              {[
                { title: 'Basic', price: '€4.99', desc: 'Per delivery', features: ['Standard delivery', 'Real-time tracking', 'Email notifications'], color: '#2563eb' },
                { title: 'Business', price: '€49.99', desc: 'Per month', features: ['Unlimited deliveries', 'Priority support', 'Advanced tracking', 'Dedicated driver'], color: '#7c3aed', popular: true },
                { title: 'Enterprise', price: 'Custom', desc: 'Contact us', features: ['Custom solutions', 'API access', 'Dedicated account manager', 'SLA guarantee'], color: '#059669' },
              ].map((plan, index) => (
                <div key={index} style={{borderRadius: '16px', padding: '32px', border: plan.popular ? `2px solid ${plan.color}` : '1px solid #f1f5f9', position: 'relative', background: plan.popular ? '#faf5ff' : 'white'}}>
                  {plan.popular && (
                    <div style={{position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px'}}>{plan.title}</h3>
                  <div style={{fontSize: '36px', fontWeight: 'bold', color: plan.color, marginBottom: '4px'}}>{plan.price}</div>
                  <div style={{color: '#64748b', fontSize: '14px', marginBottom: '24px'}}>{plan.desc}</div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px'}}>
                    {plan.features.map((feature, i) => (
                      <div key={i} style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569'}}>
                        <span style={{color: plan.color}}>✓</span> {feature}
                      </div>
                    ))}
                  </div>
                  <Link to="/register" style={{display: 'block', textAlign: 'center', background: plan.color, color: 'white', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600'}}>
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '60px 20px', textAlign: 'center', color: 'white'}}>
          <h2 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '16px'}}>Start Delivering Today</h2>
          <p style={{opacity: 0.8, marginBottom: '32px', fontSize: '18px'}}>Join hundreds of satisfied customers across Finland.</p>
          <Link to="/register" style={{background: 'white', color: '#1d4ed8', padding: '14px 32px', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none'}}>
            Get Started for Free
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

export default Services;