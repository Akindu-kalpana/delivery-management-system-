import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

/* ── Company Logo SVG — exact recreation of NKR logo ── */
const NKRLogo = () => (
  <svg viewBox="0 0 200 200" width="58" height="58" xmlns="http://www.w3.org/2000/svg" className="nkr-logo-svg" style={{ flexShrink: 0 }}>
    <defs>
      {/* Arc path for curved text along the top */}
      <path id="arcTop" d="M 16,100 A 84,84 0 0,1 184,100" />
      {/* Clip everything to the circle */}
      <clipPath id="circleClip">
        <circle cx="100" cy="100" r="95" />
      </clipPath>
    </defs>

    {/* ── Navy background circle ── */}
    <circle cx="100" cy="100" r="100" fill="#1E3A8A" />

    {/* ── Outer white ring ── */}
    <circle cx="100" cy="100" r="96" fill="none" stroke="white" strokeWidth="5" />

    {/* ── Inner white ring ── */}
    <circle cx="100" cy="100" r="83" fill="none" stroke="white" strokeWidth="2.5" />

    {/* ── Curved company name between the two rings ── */}
    <text fontSize="13" fill="white" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing="1.2">
      <textPath href="#arcTop" startOffset="4%">Nopeiden Kuljetusten Ritarit AY</textPath>
    </text>

    {/* ── Horizontal divider line ── */}
    <line x1="18" y1="106" x2="182" y2="106" stroke="white" strokeWidth="2.5" />

    {/* ── All artwork clipped inside the circle ── */}
    <g clipPath="url(#circleClip)">

      {/* ════ TRUCK ════ */}

      {/* Cargo body — horizontal speed lines forming the body, tapering right */}
      <line x1="88"  y1="115" x2="194" y2="115" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <line x1="88"  y1="124" x2="192" y2="124" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <line x1="88"  y1="133" x2="188" y2="133" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <line x1="88"  y1="142" x2="183" y2="142" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <line x1="88"  y1="151" x2="176" y2="151" stroke="white" strokeWidth="6" strokeLinecap="round" />
      {/* Speed-blur tail (shorter lines fading right beyond cargo box) */}
      <line x1="148" y1="110" x2="200" y2="110" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="155" y1="119" x2="200" y2="119" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="160" y1="128" x2="200" y2="128" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="164" y1="137" x2="200" y2="137" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="168" y1="146" x2="200" y2="146" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="172" y1="155" x2="200" y2="155" stroke="white" strokeWidth="3" strokeLinecap="round" />

      {/* Truck undercarriage / chassis line */}
      <line x1="28" y1="158" x2="180" y2="158" stroke="white" strokeWidth="2" />

      {/* Truck front bumper + headlights */}
      <rect x="22" y="144" width="72" height="16" rx="2" fill="white" />
      {/* Headlight left */}
      <rect x="28" y="147" width="22" height="9" rx="1.5" fill="#1E3A8A" />
      {/* Headlight right */}
      <rect x="56" y="147" width="16" height="9" rx="1.5" fill="#1E3A8A" />
      {/* Lower bumper bar */}
      <rect x="20" y="157" width="76" height="5" rx="1" fill="white" />

      {/* Front wheel */}
      <circle cx="58"  cy="174" r="16" fill="white" />
      <circle cx="58"  cy="174" r="8"  fill="#1E3A8A" />
      <circle cx="58"  cy="174" r="3"  fill="white" />

      {/* Rear wheel */}
      <circle cx="152" cy="174" r="16" fill="white" />
      <circle cx="152" cy="174" r="8"  fill="#1E3A8A" />
      <circle cx="152" cy="174" r="3"  fill="white" />

      {/* ════ KNIGHT HELMET — merges with truck cab ════ */}

      {/* Main helmet dome shape */}
      <path d="
        M 74 42
        C 58 40 42 54 36 70
        C 30 86 30 106 36 124
        C 40 138 48 150 54 158
        L 54 166
        L 96 166
        L 96 158
        C 104 148 108 134 108 118
        C 110 100 106 80 98 64
        C 92 50 84 42 74 42
        Z
      " fill="white" />

      {/* Diagonal visor lines across helmet face (lower-left to upper-right) */}
      <line x1="36"  y1="130" x2="100" y2="76"  stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
      <line x1="36"  y1="144" x2="102" y2="90"  stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
      <line x1="40"  y1="156" x2="104" y2="104" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
      <line x1="48"  y1="164" x2="106" y2="116" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
      <line x1="36"  y1="116" x2="96"  y2="62"  stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
      <line x1="38"  y1="102" x2="90"  y2="50"  stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
      <line x1="46"  y1="90"  x2="84"  y2="46"  stroke="#1E3A8A" strokeWidth="3.5" strokeLinecap="round" />

      {/* Round scope / rivet on right of helmet — large circle with inner white ring */}
      <circle cx="104" cy="88" r="12" fill="#1E3A8A" />
      <circle cx="104" cy="88" r="6"  fill="white" />

      {/* Plume / flag at top of helmet — gold flowing to the right */}
      <path d="M 74 42 C 80 28 92 20 106 18 C 118 16 122 22 118 28 C 114 32 106 34 100 38 C 92 42 84 44 74 42 Z" fill="#F59E0B" />
      {/* Plume inner highlight */}
      <path d="M 78 42 C 84 32 94 26 106 24 C 112 22 114 26 110 30 C 106 33 100 35 94 38 Z" fill="white" opacity="0.25" />

    </g>
  </svg>
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
            <Link to="/"        style={navLink}>{t('nav.home')}</Link>
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
            {['/', '/about', '/services', '/contact', '/track'].map((path, i) => {
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
