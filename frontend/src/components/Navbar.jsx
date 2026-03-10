import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

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
              <button onClick={() => changeLanguage('en')} className={`text-sm px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}>EN</button>
              <button onClick={() => changeLanguage('fi')} className={`text-sm px-2 py-1 rounded ${i18n.language === 'fi' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}>FI</button>
              <button onClick={() => changeLanguage('ru')} className={`text-sm px-2 py-1 rounded ${i18n.language === 'ru' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}>RU</button>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to={`/${user.role}/dashboard`} 
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  {t('dashboard.welcome')}, {user.name}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  {t('nav.logout')}
                </button>
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
              <button onClick={() => changeLanguage('en')} className="text-sm px-2 py-1 bg-gray-100 rounded">EN</button>
              <button onClick={() => changeLanguage('fi')} className="text-sm px-2 py-1 bg-gray-100 rounded">FI</button>
              <button onClick={() => changeLanguage('ru')} className="text-sm px-2 py-1 bg-gray-100 rounded">RU</button>
            </div>
            {user ? (
              <button onClick={handleLogout} className="block text-red-500">{t('nav.logout')}</button>
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