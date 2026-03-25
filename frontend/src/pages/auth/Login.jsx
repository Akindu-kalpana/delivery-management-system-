import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.data.user.role === 'driver') navigate('/driver/dashboard');
      else navigate('/user/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || t('auth.login') + ' failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)'}} className="flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚚</div>
          <h1 className="text-2xl font-bold text-gray-800">NKR Delivery</h1>
          <p className="text-gray-500 mt-1">{t('auth.login')}</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{background: '#fee2e2', color: '#ef4444'}} className="px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 16px', width: '100%'}}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px 16px', width: '100%'}}
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{background: '#2563eb', color: 'white', width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', border: 'none'}}
          >
            {loading ? t('auth.loading') : t('auth.login')}
          </button>
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          {t('auth.noAccount')}{' '}
          <Link to="/register" style={{color: '#2563eb', fontWeight: '500'}}>
            {t('nav.register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
