import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/Navbar';

const Landing = () => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({ deliveries: 0, clients: 0, languages: 0 });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          animateCounter('deliveries', 500, 2000);
          animateCounter('clients', 50, 2000);
          animateCounter('languages', 3, 1000);
        }
      },
      { threshold: 0.5 }
    );
    if (statsRef.current) statsObserver.observe(statsRef.current);
    return () => statsObserver.disconnect();
  }, [statsAnimated]);

  const animateCounter = (key, target, duration) => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(prev => ({ ...prev, [key]: Math.floor(eased * target) }));
      if (progress === 1) clearInterval(timer);
    }, 16);
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc', overflow: 'hidden'}}>
      <Navbar />

      {/* Hero Section */}
      <section className="animated-bg" style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
        
        {/* Particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{
            width: `${Math.random() * 100 + 40}px`,
            height: `${Math.random() * 100 + 40}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${Math.random() * 4 + 4}s`
          }}/>
        ))}

        {/* Glowing circles */}
        <div style={{position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'float 6s ease-in-out infinite'}}></div>
        <div style={{position: 'absolute', bottom: '10%', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', animation: 'float 8s ease-in-out infinite reverse'}}></div>

        <div style={{position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 20px', maxWidth: '900px', margin: '0 auto'}}>
          
          {/* Badge */}
          <div className="glass hero-title" style={{display: 'inline-block', padding: '8px 20px', borderRadius: '50px', marginBottom: '32px', fontSize: '14px', color: 'rgba(255,255,255,0.9)'}}>
            🇫🇮 Finland's First AI Delivery Platform
          </div>

          {/* Truck */}
          <div className="hero-truck" style={{fontSize: '100px', marginBottom: '24px'}}>🚚</div>

          {/* Title */}
          <h1 className="hero-title gradient-text" style={{fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px'}}>
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle" style={{fontSize: 'clamp(16px, 3vw, 22px)', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6'}}>
            {t('hero.subtitle')}
          </p>

          {/* Buttons */}
          <div className="hero-buttons" style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/register" className="btn-hover" style={{background: 'white', color: '#1d4ed8', padding: '16px 36px', borderRadius: '50px', fontWeight: '700', fontSize: '16px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 30px rgba(0,0,0,0.2)'}}>
              🚀 {t('hero.cta')}
            </Link>
            <Link to="/track" className="btn-hover" style={{background: 'rgba(255,255,255,0.15)', color: 'white', padding: '16px 36px', borderRadius: '50px', fontWeight: '700', fontSize: '16px', textDecoration: 'none', display: 'inline-block', border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)'}}>
              📍 {t('hero.track')}
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator" style={{marginTop: '60px'}}>
            <div style={{width: '30px', height: '50px', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '15px', margin: '0 auto', display: 'flex', justifyContent: 'center', paddingTop: '8px'}}>
              <div style={{width: '4px', height: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: '2px', animation: 'fadeInUp 1s ease infinite'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} style={{background: 'white', padding: '80px 20px'}}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center'}}>
            {[
              { value: counts.deliveries + '+', label: 'Deliveries Completed', icon: '📦', color: '#2563eb' },
              { value: counts.clients + '+', label: 'Happy Clients', icon: '😊', color: '#7c3aed' },
              { value: counts.languages, label: 'Languages Supported', icon: '🌍', color: '#059669' },
              { value: '24/7', label: 'Customer Support', icon: '💬', color: '#dc2626' },
            ].map((stat, index) => (
              <div key={index} className={`reveal delay-${index + 1}`} style={{padding: '32px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #f1f5f9'}}>
                <div style={{fontSize: '40px', marginBottom: '12px'}}>{stat.icon}</div>
                <div style={{fontSize: '48px', fontWeight: '900', color: stat.color, marginBottom: '8px'}}>{stat.value}</div>
                <div style={{color: '#64748b', fontWeight: '500'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{background: '#f8fafc', padding: '80px 20px'}}>
        <div style={{maxWidth: '1100px', margin: '0 auto'}}>
          <div className="reveal" style={{textAlign: 'center', marginBottom: '60px'}}>
            <h2 style={{fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#1e293b', marginBottom: '16px'}}>Why Choose NKR Delivery?</h2>
            <p style={{color: '#64748b', fontSize: '18px', maxWidth: '600px', margin: '0 auto'}}>We make delivery simple, fast and accessible for everyone</p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'}}>
            {[
              { icon: '🤖', title: 'AI-Powered Booking', desc: 'Book your delivery by simply chatting with our AI assistant. No forms, no hassle. Just natural conversation.', color: '#2563eb' },
              { icon: '🌍', title: 'Multilingual Support', desc: 'Use the system in English, Finnish, or Russian. The chatbot responds in your language automatically.', color: '#7c3aed' },
              { icon: '📍', title: 'Real-Time Tracking', desc: 'Track your delivery status in real time from pickup to final delivery with live status updates.', color: '#059669' },
              { icon: '🔒', title: 'Secure & Reliable', desc: 'Your data is protected with JWT authentication and role-based access control for maximum security.', color: '#dc2626' },
              { icon: '⚡', title: 'Fast Delivery', desc: 'We ensure your packages are delivered quickly and safely across Finland with dedicated drivers.', color: '#d97706' },
              { icon: '📱', title: 'Works Everywhere', desc: 'Access the platform from any device — desktop, tablet, or mobile. Always available when you need it.', color: '#0891b2' },
            ].map((feature, index) => (
              <div key={index} className={`reveal card-hover delay-${index + 1}`} style={{background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderTop: `4px solid ${feature.color}`}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>{feature.icon}</div>
                <h3 style={{fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '12px'}}>{feature.title}</h3>
                <p style={{color: '#64748b', lineHeight: '1.7'}}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{background: 'white', padding: '80px 20px'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <div className="reveal" style={{textAlign: 'center', marginBottom: '60px'}}>
            <h2 style={{fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#1e293b', marginBottom: '16px'}}>How It Works</h2>
            <p style={{color: '#64748b', fontSize: '18px'}}>Book a delivery in just 4 simple steps</p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px'}}>
            {[
              { step: '01', icon: '📝', title: 'Register', desc: 'Create your free account in seconds', color: '#2563eb' },
              { step: '02', icon: '💬', title: 'Chat with AI', desc: 'Tell our chatbot what you need to deliver', color: '#7c3aed' },
              { step: '03', icon: '✅', title: 'Confirm', desc: 'Review the details and confirm your booking', color: '#059669' },
              { step: '04', icon: '🚚', title: 'Track', desc: 'Track your delivery from pickup to delivery', color: '#dc2626' },
            ].map((item, index) => (
              <div key={index} className={`reveal delay-${index + 1}`} style={{textAlign: 'center', padding: '32px 20px'}}>
                <div style={{width: '64px', height: '64px', borderRadius: '50%', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', margin: '0 auto 16px'}}>
                  {item.step}
                </div>
                <div style={{fontSize: '40px', marginBottom: '12px'}}>{item.icon}</div>
                <h3 style={{fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px'}}>{item.title}</h3>
                <p style={{color: '#64748b', fontSize: '14px', lineHeight: '1.6'}}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{background: '#f8fafc', padding: '80px 20px'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <div className="reveal" style={{textAlign: 'center', marginBottom: '60px'}}>
            <h2 style={{fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#1e293b', marginBottom: '16px'}}>What Our Customers Say</h2>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px'}}>
            {[
              { name: 'Mikko Virtanen', role: 'Business Owner', text: 'The AI chatbot made booking so easy. I just typed what I needed and it handled everything. Amazing!', avatar: '👨‍💼' },
              { name: 'Anna Korhonen', role: 'Regular Customer', text: 'I love that I can use it in Finnish. Finally a delivery service that speaks my language!', avatar: '👩‍💻' },
              { name: 'Ivan Petrov', role: 'Entrepreneur', text: 'Russian language support is perfect. The tracking feature is very accurate and reliable.', avatar: '👨‍🔧' },
            ].map((testimonial, index) => (
              <div key={index} className={`reveal card-hover delay-${index + 1}`} style={{background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize: '32px', marginBottom: '16px'}}>⭐⭐⭐⭐⭐</div>
                <p style={{color: '#475569', lineHeight: '1.7', marginBottom: '24px', fontStyle: 'italic'}}>"{testimonial.text}"</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{fontSize: '40px'}}>{testimonial.avatar}</div>
                  <div>
                    <div style={{fontWeight: '700', color: '#1e293b'}}>{testimonial.name}</div>
                    <div style={{color: '#64748b', fontSize: '14px'}}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="animated-bg" style={{padding: '100px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)'}}></div>
        <div style={{position: 'relative', zIndex: 1}}>
          <div className="reveal" style={{fontSize: '64px', marginBottom: '24px'}}>🚀</div>
          <h2 className="reveal gradient-text" style={{fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '900', marginBottom: '16px'}}>Ready to Ship?</h2>
          <p className="reveal" style={{color: 'rgba(255,255,255,0.8)', fontSize: '20px', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px'}}>
            Join hundreds of satisfied customers and start booking deliveries today.
          </p>
          <Link to="/register" className="btn-hover reveal" style={{background: 'white', color: '#1d4ed8', padding: '18px 48px', borderRadius: '50px', fontWeight: '800', fontSize: '18px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 30px rgba(0,0,0,0.2)'}}>
            Get Started for Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background: '#0f172a', color: '#94a3b8', padding: '60px 20px 40px'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px'}}>
            <div>
              <div style={{fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '12px'}}>🚚 NKR Delivery</div>
              <p style={{lineHeight: '1.7', fontSize: '14px'}}>Finland's first AI-powered delivery booking platform. Fast, reliable, multilingual.</p>
            </div>
            <div>
              <div style={{fontWeight: '700', color: 'white', marginBottom: '16px'}}>Quick Links</div>
              {[['Home', '/'], ['About', '/about'], ['Services', '/services'], ['Contact', '/contact']].map(([label, path]) => (
                <div key={path} style={{marginBottom: '8px'}}>
                  <Link to={path} style={{color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s'}}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#94a3b8'}
                  >{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontWeight: '700', color: 'white', marginBottom: '16px'}}>Contact</div>
              <div style={{fontSize: '14px', lineHeight: '2'}}>
                <div>📍 Oulu, Finland</div>
                <div>📞 +358 40 123 4567</div>
                <div>📧 info@nkrdelivery.fi</div>
              </div>
            </div>
            <div>
              <div style={{fontWeight: '700', color: 'white', marginBottom: '16px'}}>Languages</div>
              <div style={{fontSize: '14px', lineHeight: '2'}}>
                <div>🇬🇧 English</div>
                <div>🇫🇮 Finnish</div>
                <div>🇷🇺 Russian</div>
              </div>
            </div>
          </div>
          <div style={{borderTop: '1px solid #1e293b', paddingTop: '24px', textAlign: 'center', fontSize: '13px'}}>
            © 2025 Nopeiden Kuljetusten Ritarit AY. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;