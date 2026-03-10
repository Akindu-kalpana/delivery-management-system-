import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, [token]);

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/deliveries/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(res.data.deliveries);

      // Extract unique drivers from deliveries
      const uniqueDrivers = res.data.deliveries
        .filter(d => d.driver_id)
        .reduce((acc, d) => {
          if (!acc.find(dr => dr.id === d.driver_id)) {
            acc.push({ id: d.driver_id, name: d.driver_name });
          }
          return acc;
        }, []);
      setDrivers(uniqueDrivers);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, driver_id) => {
    setUpdating(id);
    try {
      await axios.put(
        `http://localhost:5000/api/deliveries/${id}/status`,
        { status, driver_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDeliveries();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

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

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '80px 20px 40px'}}>

        {/* Header */}
        <div style={{background: 'linear-gradient(135deg, #dc2626, #ef4444)', borderRadius: '16px', padding: '32px', marginBottom: '32px', color: 'white'}}>
          <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '8px'}}>
            🛠 {t('dashboard.welcome')}, {user?.name}!
          </h1>
          <p style={{opacity: 0.8}}>Manage all deliveries from here</p>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px'}}>
          {[
            { label: 'Total Deliveries', value: deliveries.length, color: '#dc2626' },
            { label: 'Pending', value: deliveries.filter(d => d.status === 'pending').length, color: '#f59e0b' },
            { label: 'In Transit', value: deliveries.filter(d => d.status === 'in_transit').length, color: '#3b82f6' },
            { label: 'Delivered', value: deliveries.filter(d => d.status === 'delivered').length, color: '#10b981' },
          ].map((stat, index) => (
            <div key={index} style={{background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
              <div style={{fontSize: '32px', fontWeight: 'bold', color: stat.color}}>{stat.value}</div>
              <div style={{fontSize: '13px', color: '#64748b', marginTop: '4px'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* All deliveries */}
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b'}}>
            📦 {t('dashboard.allDeliveries')}
          </h2>

          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Loading...</div>
          ) : deliveries.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>📭</div>
              <p style={{color: '#94a3b8'}}>No deliveries yet</p>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid #f1f5f9'}}>
                    {['ID', 'User', 'Receiver', 'Pickup', 'Delivery', 'Driver', 'Status', 'Action'].map((h) => (
                      <th key={h} style={{padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '13px'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                      <td style={{padding: '12px', color: '#1e293b', fontWeight: '600'}}>#{delivery.id}</td>
                      <td style={{padding: '12px', color: '#1e293b', fontSize: '13px'}}>{delivery.user_name}</td>
                      <td style={{padding: '12px', color: '#1e293b', fontSize: '13px'}}>{delivery.receiver_name}</td>
                      <td style={{padding: '12px', color: '#64748b', fontSize: '12px'}}>{delivery.pickup_address}</td>
                      <td style={{padding: '12px', color: '#64748b', fontSize: '12px'}}>{delivery.delivery_address}</td>
                      <td style={{padding: '12px', color: '#1e293b', fontSize: '13px'}}>{delivery.driver_name || 'Not assigned'}</td>
                      <td style={{padding: '12px'}}>
                        <span style={{background: getStatusColor(delivery.status), color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'}}>
                          {delivery.status}
                        </span>
                      </td>
                      <td style={{padding: '12px'}}>
                        <select
                          value={delivery.status}
                          onChange={(e) => updateStatus(delivery.id, e.target.value, delivery.driver_id)}
                          disabled={updating === delivery.id}
                          style={{border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer'}}
                        >
                          <option value="pending">Pending</option>
                          <option value="picked_up">Picked Up</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
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

export default AdminDashboard;