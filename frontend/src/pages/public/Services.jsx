import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';

const Services = () => {
  const { t } = useTranslation();

  const servicesList = [
    { icon: '🤖', key: 'ai', color: '#2563eb' },
    { icon: '📍', key: 'tracking', color: '#7c3aed' },
    { icon: '🌍', key: 'multilingual', color: '#059669' },
    { icon: '🚚', key: 'sameDay', color: '#dc2626' },
    { icon: '📦', key: 'management', color: '#d97706' },
    { icon: '🔒', key: 'secure', color: '#0891b2' },
  ];

  const plans = [
    {
      key: 'basic',
      color: '#2563eb',
      features: ['feature1', 'feature2', 'feature3'],
    },
    {
      key: 'business',
      color: '#7c3aed',
      popular: true,
      features: ['feature1', 'feature2', 'feature3', 'feature4'],
    },
    {
      key: 'enterprise',
      color: '#059669',
      features: ['feature1', 'feature2', 'feature3', 'feature4'],
    },
  ];

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />

      <div style={{paddingTop: '80px'}}>

        {/* Hero */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '96px 20px', textAlign: 'center', color: 'white'}}>
          <h1 className="hero-h1-responsive" style={{fontSize: '42px', fontWeight: 'bold', marginBottom: '16px'}}>{t('services.title')}</h1>
          <p style={{fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto'}}>
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services */}
        <div style={{maxWidth: '1000px', margin: '0 auto', padding: '60px 20px'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px'}}>
            {servicesList.map((service, index) => (
              <div key={index} style={{background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${service.color}`}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>{service.icon}</div>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px'}}>{t(`services.${service.key}.title`)}</h3>
                <p style={{color: '#64748b', lineHeight: '1.7'}}>{t(`services.${service.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div style={{background: 'white', padding: '60px 20px'}}>
          <div style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 style={{fontSize: '32px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: '8px'}}>{t('services.pricing.title')}</h2>
            <p style={{textAlign: 'center', color: '#64748b', marginBottom: '48px'}}>{t('services.pricing.subtitle')}</p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px'}}>
              {plans.map((plan, index) => (
                <div key={index} style={{borderRadius: '16px', padding: '32px', border: plan.popular ? `2px solid ${plan.color}` : '1px solid #f1f5f9', position: 'relative', background: plan.popular ? '#faf5ff' : 'white'}}>
                  {plan.popular && (
                    <div style={{position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                      {t('services.pricing.mostPopular')}
                    </div>
                  )}
                  <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px'}}>{t(`services.pricing.${plan.key}.title`)}</h3>
                  <div style={{fontSize: '36px', fontWeight: 'bold', color: plan.color, marginBottom: '4px'}}>{t(`services.pricing.${plan.key}.price`)}</div>
                  <div style={{color: '#64748b', fontSize: '14px', marginBottom: '24px'}}>{t(`services.pricing.${plan.key}.desc`)}</div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px'}}>
                    {plan.features.map((feature, i) => (
                      <div key={i} style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569'}}>
                        <span style={{color: plan.color}}>✓</span> {t(`services.pricing.${plan.key}.${feature}`)}
                      </div>
                    ))}
                  </div>
                  <Link to="/register" style={{display: 'block', textAlign: 'center', background: plan.color, color: 'white', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600'}}>
                    {t('services.pricing.getStarted')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '60px 20px', textAlign: 'center', color: 'white'}}>
          <h2 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '16px'}}>{t('services.cta.title')}</h2>
          <p style={{opacity: 0.8, marginBottom: '32px', fontSize: '18px'}}>{t('services.cta.subtitle')}</p>
          <Link to="/register" style={{background: 'white', color: '#1d4ed8', padding: '14px 32px', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none'}}>
            {t('services.cta.button')}
          </Link>
        </div>

        {/* Footer */}
        <footer style={{background: '#1e293b', color: '#94a3b8', padding: '40px 20px', textAlign: 'center'}}>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>🚚 NKR Delivery</div>
          <p style={{marginBottom: '16px'}}>Nopeiden Kuljetusten Ritarit AY</p>
          <p style={{fontSize: '13px'}}>{t('services.footer.copyright')}</p>
        </footer>
      </div>
    </div>
  );
};

export default Services;
