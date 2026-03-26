import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

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

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const languages = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'fi', label: 'FI', flag: '🇫🇮' },
    { code: 'ru', label: 'RU', flag: '🇷🇺' },
    { code: 'sv', label: 'SV', flag: '🇸🇪' },
  ];

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🚚</span>
            <span className="font-bold text-xl text-blue-600">NKR Delivery</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition">{t('nav.home')}</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition">{t('nav.about')}</Link>
            <Link to="/services" className="text-gray-600 hover:text-blue-600 transition">{t('nav.services')}</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition">{t('nav.contact')}</Link>
            <Link to="/track" className="text-gray-600 hover:text-blue-600 transition">{t('nav.track')}</Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Language switcher */}
            <div className="flex items-center space-x-1">
              {languages.map(({ code, label, flag }) => (
                <button
                  key={code}
                  onClick={() => changeLanguage(code)}
                  title={flag}
                  className={`text-sm px-2 py-1 rounded transition ${
                    i18n.language === code
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* User dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: '600', color: '#1e293b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    👤 {user.name} ▾
                  </button>
                  {userMenuOpen && (
                    <div style={{ position: 'absolute', right: 0, top: '110%', background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '210px', zIndex: 100, padding: '6px', border: '1px solid #f1f5f9' }}>
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
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">{t('nav.login')}</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">{t('nav.register')}</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link to="/" className="block text-gray-600 hover:text-blue-600">{t('nav.home')}</Link>
            <Link to="/about" className="block text-gray-600 hover:text-blue-600">{t('nav.about')}</Link>
            <Link to="/services" className="block text-gray-600 hover:text-blue-600">{t('nav.services')}</Link>
            <Link to="/contact" className="block text-gray-600 hover:text-blue-600">{t('nav.contact')}</Link>
            <Link to="/track" className="block text-gray-600 hover:text-blue-600">{t('nav.track')}</Link>
            <div className="flex space-x-2 pt-2">
              {languages.map(({ code, label, flag }) => (
                <button
                  key={code}
                  onClick={() => changeLanguage(code)}
                  title={flag}
                  className={`text-sm px-2 py-1 rounded ${
                    i18n.language === code ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {user ? (
              <>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  {(userLinks[user.role] || []).map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className="block text-gray-600 hover:text-blue-600 py-1"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', textDecoration: 'none', fontSize: '14px' }}
                    >
                      {link.icon} {t(link.labelKey)}
                    </Link>
                  ))}
                </div>
                <button onClick={handleLogout} className="block text-red-500 pt-2">{t('nav.logout')}</button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block text-gray-600">{t('nav.login')}</Link>
                <Link to="/register" className="block text-blue-600">{t('nav.register')}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
