import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';

const About = () => {
  const { t } = useTranslation();

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '64px'}}>

        {/* Hero */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '80px 20px', textAlign: 'center', color: 'white'}}>
          <h1 style={{fontSize: '42px', fontWeight: 'bold', marginBottom: '16px'}}>{t('about.title')}</h1>
          <p style={{fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto'}}>
            {t('about.subtitle')}
          </p>
        </div>

        {/* Story */}
        <div style={{maxWidth: '900px', margin: '0 auto', padding: '60px 20px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center'}}>
            <div>
              <h2 style={{fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px'}}>{t('about.story.title')}</h2>
              <p style={{color: '#64748b', lineHeight: '1.8', marginBottom: '16px'}}>{t('about.story.p1')}</p>
              <p style={{color: '#64748b', lineHeight: '1.8', marginBottom: '16px'}}>{t('about.story.p2')}</p>
              <p style={{color: '#64748b', lineHeight: '1.8'}}>{t('about.story.p3')}</p>
            </div>
            <div style={{textAlign: 'center', fontSize: '120px'}}>🚚</div>
          </div>
        </div>

        {/* Values */}
        <div style={{background: 'white', padding: '60px 20px'}}>
          <div style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 style={{fontSize: '32px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: '48px'}}>{t('about.values.title')}</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px'}}>
              {[
                { icon: '⚡', key: 'speed' },
                { icon: '🤝', key: 'reliability' },
                { icon: '🌍', key: 'accessibility' },
                { icon: '🔒', key: 'security' },
              ].map((value, index) => (
                <div key={index} style={{textAlign: 'center', padding: '32px', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#f8fafc'}}>
                  <div style={{fontSize: '48px', marginBottom: '16px'}}>{value.icon}</div>
                  <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px'}}>{t(`about.values.${value.key}.title`)}</h3>
                  <p style={{color: '#64748b', lineHeight: '1.6'}}>{t(`about.values.${value.key}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '60px 20px', textAlign: 'center', color: 'white'}}>
          <h2 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '16px'}}>{t('about.cta.title')}</h2>
          <p style={{opacity: 0.8, marginBottom: '32px', fontSize: '18px'}}>{t('about.cta.subtitle')}</p>
          <Link to="/register" style={{background: 'white', color: '#1d4ed8', padding: '14px 32px', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none'}}>
            {t('about.cta.button')}
          </Link>
        </div>

        {/* Footer */}
        <footer style={{background: '#1e293b', color: '#94a3b8', padding: '40px 20px', textAlign: 'center'}}>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>🚚 NKR Delivery</div>
          <p style={{marginBottom: '16px'}}>Nopeiden Kuljetusten Ritarit AY</p>
          <p style={{fontSize: '13px'}}>{t('about.footer.copyright')}</p>
        </footer>
      </div>
    </div>
  );
};

export default About;
