import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

/* ── Company Logo Image ── */
const NKRLogo = () => (
  <img
    src="/WhatsApp Image 2026-03-26 at 6.38.06 PM.png"
    alt="NKR Delivery Logo"
    width="58"
    height="58"
    style={{ flexShrink: 0, borderRadius: '50%', objectFit: 'cover' }}
  />
);

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userLinks = {
    user: [
      { path: '/user/dashboard',      icon: '🏠', labelKey: 'nav.dashboard' },
      { path: '/user/book',           icon: '📦', labelKey: 'dashboard.bookDelivery' },
      { path: '/user/track',          icon: '📍', labelKey: 'dashboard.trackDelivery' },
      { path: '/user/history',        icon: '📋', labelKey: 'dashboard.deliveryHistory' },
      { path: '/user/complaints',     icon: '📣', labelKey: 'dashboard.complaints' },
      { path: '/user/damage-claim',   icon: '🔍', labelKey: 'dashboard.damageClaim' },
      { path: '/user/loyalty',        icon: '⭐', labelKey: 'dashboard.loyaltyPoints' },
      { path: '/user/addresses',      icon: '🗂️', labelKey: 'dashboard.savedAddresses' },
      { path: '/user/bulk-orders',    icon: '📂', labelKey: 'dashboard.bulkOrders' },
      { path: '/user/price-estimate', icon: '💶', labelKey: 'dashboard.priceEstimate' },
    ],
    driver: [
      { path: '/driver/dashboard', icon: '🚚', labelKey: 'nav.myDeliveries' },
    ],
    admin: [
      { path: '/admin/dashboard', icon: '⚙️', labelKey: 'nav.adminDashboard' },
    ],
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (lang) => i18n.changeLanguage(lang);

  const languages = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'fi', label: 'FI', flag: '🇫🇮' },
    { code: 'ru', label: 'RU', flag: '🇷🇺' },
    { code: 'sv', label: 'SV', flag: '🇸🇪' },
  ];

  return (
    <nav style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', position: 'fixed', width: '100%', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Main bar — h-20 = 80px */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>

          {/* ── Logo ── */}
          <Link to={user ? (user.role === 'admin' ? '/admin/dashboard' : user.role === 'driver' ? '/driver/dashboard' : '/user/dashboard') : '/'} className="nkr-logo-gap" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <NKRLogo />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span className="nkr-logo-text" style={{ fontWeight: '800', fontSize: '18px', color: '#1E3A8A', letterSpacing: '-0.3px' }}>NKR Delivery</span>
              <span className="nkr-subtitle" style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', letterSpacing: '0.4px' }}>Nopeiden Kuljetusten Ritarit AY</span>
            </div>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '28px' }}>
            <Link to={user ? (user.role === 'admin' ? '/admin/dashboard' : user.role === 'driver' ? '/driver/dashboard' : '/user/dashboard') : '/'} style={navLink}>{t('nav.home')}</Link>
            <Link to="/about"   style={navLink}>{t('nav.about')}</Link>
            <Link to="/services" style={navLink}>{t('nav.services')}</Link>
            <Link to="/contact" style={navLink}>{t('nav.contact')}</Link>
            <Link to="/track"   style={navLink}>{t('nav.track')}</Link>
          </div>

          {/* ── Right side ── */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '16px' }}>

            {/* Language switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {languages.map(({ code, label, flag }) => (
                <button
                  key={code}
                  onClick={() => changeLanguage(code)}
                  title={flag}
                  style={{
                    fontSize: '13px', padding: '5px 9px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600',
                    background: i18n.language === code ? '#1E3A8A' : 'transparent',
                    color:      i18n.language === code ? 'white'   : '#64748b',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', color: '#1e293b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  👤 {user.name} ▾
                </button>
                {userMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: 'white', borderRadius: '12px', boxShadow: '0 8px 28px rgba(0,0,0,0.13)', minWidth: '220px', zIndex: 100, padding: '6px', border: '1px solid #f1f5f9' }}>
                    {(userLinks[user.role] || []).map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', color: '#374151', fontSize: '14px', fontWeight: '500' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span>{link.icon}</span> {t(link.labelKey)}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '4px', paddingTop: '4px' }}>
                      <button
                        onClick={handleLogout}
                        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '14px', fontWeight: '500' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        🚪 {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/login"    style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}>{t('nav.login')}</Link>
                <Link to="/register" style={{ background: '#1E3A8A', color: 'white', padding: '9px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>{t('nav.register')}</Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden"
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#475569' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingBottom: '16px' }} className="md:hidden">
            {[user ? (user.role === 'admin' ? '/admin/dashboard' : user.role === 'driver' ? '/driver/dashboard' : '/user/dashboard') : '/', '/about', '/services', '/contact', '/track'].map((path, i) => {
              const labels = [t('nav.home'), t('nav.about'), t('nav.services'), t('nav.contact'), t('nav.track')];
              return (
                <Link key={path} to={path} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '10px 4px', color: '#475569', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>
                  {labels[i]}
                </Link>
              );
            })}
            <div style={{ display: 'flex', gap: '6px', padding: '8px 0' }}>
              {languages.map(({ code, label, flag }) => (
                <button key={code} onClick={() => changeLanguage(code)} title={flag}
                  style={{ fontSize: '13px', padding: '5px 9px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', background: i18n.language === code ? '#1E3A8A' : '#f1f5f9', color: i18n.language === code ? 'white' : '#64748b' }}>
                  {label}
                </button>
              ))}
            </div>
            {user ? (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                {(userLinks[user.role] || []).map(link => (
                  <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 4px', textDecoration: 'none', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                    {link.icon} {t(link.labelKey)}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '10px 4px' }}>
                  🚪 {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
                <Link to="/login"    style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>{t('nav.login')}</Link>
                <Link to="/register" style={{ color: '#1E3A8A', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>{t('nav.register')}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

const navLink = {
  color: '#475569',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'color 0.15s',
};

export default Navbar;
