import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/deliveries/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDeliveries(res.data.deliveries);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'picked_up': return '#3b82f6';
      case 'in_transit': return '#8b5cf6';
      case 'delivered': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc'}}>
      <Navbar />
      
      <div style={{paddingTop: '80px', maxWidth: '1200px', margin: '0 auto', padding: '80px 20px 40px'}}>
        
        {/* Welcome header */}
        <div style={{background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '16px', padding: '32px', marginBottom: '32px', color: 'white'}}>
          <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '8px'}}>
            👋 {t('dashboard.welcome')}, {user?.name}!
          </h1>
          <p style={{opacity: 0.8}}>Manage your deliveries from here</p>
        </div>

        {/* Quick actions */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px'}}>
          {[
            { icon: '📦', label: 'Book Delivery', path: '/user/book', color: '#2563eb' },
            { icon: '📍', label: 'Track Delivery', path: '/user/track', color: '#7c3aed' },
            { icon: '📋', label: 'Delivery History', path: '/user/history', color: '#059669' },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.path}
              style={{background: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: `2px solid transparent`, transition: 'all 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.borderColor = action.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{fontSize: '40px', marginBottom: '12px'}}>{action.icon}</div>
              <div style={{fontWeight: '600', color: action.color}}>{action.label}</div>
            </Link>
          ))}
        </div>

        {/* Recent deliveries */}
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b'}}>
            📦 {t('dashboard.myDeliveries')}
          </h2>

          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Loading...</div>
          ) : deliveries.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>📭</div>
              <p style={{color: '#94a3b8', marginBottom: '16px'}}>No deliveries yet</p>
              <Link
                to="/user/book"
                style={{background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600'}}
              >
                Book Your First Delivery
              </Link>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid #f1f5f9'}}>
                    <th style={{padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600'}}>ID</th>
                    <th style={{padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600'}}>Receiver</th>
                    <th style={{padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600'}}>Delivery Address</th>
                    <th style={{padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600'}}>Status</th>
                    <th style={{padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600'}}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                      <td style={{padding: '12px', color: '#1e293b'}}>#{delivery.id}</td>
                      <td style={{padding: '12px', color: '#1e293b'}}>{delivery.receiver_name}</td>
                      <td style={{padding: '12px', color: '#1e293b'}}>{delivery.delivery_address}</td>
                      <td style={{padding: '12px'}}>
                        <span style={{background: getStatusColor(delivery.status), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                          {delivery.status}
                        </span>
                      </td>
                      <td style={{padding: '12px', color: '#64748b', fontSize: '14px'}}>
                        {new Date(delivery.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;