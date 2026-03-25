import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const TIERS = [
  { name: 'Bronze', min: 0, max: 99, color: '#CD7F32', bg: '#fdf6ee', icon: '🥉' },
  { name: 'Silver', min: 100, max: 499, color: '#A8A9AD', bg: '#f5f5f5', icon: '🥈' },
  { name: 'Gold', min: 500, max: 999, color: '#FFD700', bg: '#fffbeb', icon: '🥇' },
  { name: 'Platinum', min: 1000, max: Infinity, color: '#9E9E9E', bg: '#f0f0f5', icon: '💎' },
];

const TIER_BENEFITS = [
  { benefit: 'Free standard delivery', bronze: '❌', silver: '✅', gold: '✅', platinum: '✅' },
  { benefit: 'Priority support', bronze: '❌', silver: '❌', gold: '✅', platinum: '✅' },
  { benefit: 'Express discount', bronze: '❌', silver: '5%', gold: '10%', platinum: '20%' },
  { benefit: 'Birthday bonus points', bronze: '❌', silver: '50', gold: '100', platinum: '200' },
  { benefit: 'Dedicated account manager', bronze: '❌', silver: '❌', gold: '❌', platinum: '✅' },
];

const Loyalty = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [redeemError, setRedeemError] = useState('');

  useEffect(() => {
    fetchLoyaltyInfo();
  }, []);

  const fetchLoyaltyInfo = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/loyalty/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInfo(res.data);
    } catch (err) {
      setError('Failed to load loyalty information.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const points = parseInt(redeemPoints);
    if (!points || points < 1) {
      setRedeemError('Please enter a valid number of points.');
      return;
    }
    if (info && points > info.current_points) {
      setRedeemError('You do not have enough points.');
      return;
    }
    setRedeeming(true);
    setRedeemError('');
    setRedeemSuccess('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/loyalty/redeem',
        { points },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRedeemSuccess(`Successfully redeemed ${points} points for €${(points * 0.05).toFixed(2)} discount!`);
      setRedeemPoints('');
      fetchLoyaltyInfo();
    } catch (err) {
      setRedeemError(err.response?.data?.message || 'Failed to redeem points.');
    } finally {
      setRedeeming(false);
    }
  };

  const getCurrentTier = (points) => {
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (points >= TIERS[i].min) return TIERS[i];
    }
    return TIERS[0];
  };

  const getNextTier = (points) => {
    for (let i = 0; i < TIERS.length; i++) {
      if (points < TIERS[i].max && TIERS[i].max !== Infinity) {
        if (points >= TIERS[i].min) {
          return i + 1 < TIERS.length ? TIERS[i + 1] : null;
        }
      }
    }
    return null;
  };

  const getProgressToNext = (points) => {
    const tier = getCurrentTier(points);
    const nextTier = getNextTier(points);
    if (!nextTier) return 100;
    const range = nextTier.min - tier.min;
    const progress = points - tier.min;
    return Math.min(100, Math.round((progress / range) * 100));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#94a3b8' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
            Loading loyalty info...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ maxWidth: '700px', margin: '80px auto 0', padding: '20px' }}>
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '16px', borderRadius: '10px' }}>{error}</div>
        </div>
      </div>
    );
  }

  const points = info?.current_points || 0;
  const currentTier = getCurrentTier(points);
  const nextTier = getNextTier(points);
  const progress = getProgressToNext(points);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '80px 20px 40px' }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}cc)`, borderRadius: '16px', padding: '28px', marginBottom: '28px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>{currentTier.icon}</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
            {currentTier.name} Member
          </h1>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>Your Loyalty Rewards Program</p>
        </div>

        {/* Points Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Current Points', value: points.toLocaleString(), icon: '⭐', color: currentTier.color },
            { label: 'Total Earned', value: (info?.total_earned || 0).toLocaleString(), icon: '📈', color: '#2563eb' },
            { label: 'Total Redeemed', value: (info?.total_redeemed || 0).toLocaleString(), icon: '💳', color: '#7c3aed' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Progress to Next Tier */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '16px' }}>Progress to {nextTier ? nextTier.name : 'Max Tier'}</div>
              {nextTier && (
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  {nextTier.min - points} points needed
                </div>
              )}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: currentTier.color }}>{progress}%</div>
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '14px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier?.color || currentTier.color})`, width: `${progress}%`, borderRadius: '10px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
            <span>{currentTier.icon} {currentTier.name} ({currentTier.min})</span>
            {nextTier && <span>{nextTier.icon} {nextTier.name} ({nextTier.min})</span>}
          </div>
        </div>

        {/* Tier Benefits */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>
            🎁 Tier Benefits
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #f1f5f9' }}>Benefit</th>
                  {TIERS.map(tier => (
                    <th key={tier.name} style={{ padding: '10px', textAlign: 'center', color: tier.color, fontWeight: '700', borderBottom: '2px solid #f1f5f9' }}>
                      {tier.icon} {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIER_BENEFITS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                    <td style={{ padding: '10px', color: '#374151' }}>{row.benefit}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{row.bronze}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{row.silver}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{row.gold}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{row.platinum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Redeem Points */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            💳 Redeem Points
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
            1 point = €0.05 discount · You have <strong style={{ color: currentTier.color }}>{points} points</strong> (€{(points * 0.05).toFixed(2)} value)
          </p>

          {redeemError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{redeemError}</div>}
          {redeemSuccess && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>✅ {redeemSuccess}</div>}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '14px' }}>
                Points to Redeem
              </label>
              <input
                type="number"
                value={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.value)}
                placeholder="e.g. 100"
                min="1"
                max={points}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
              {redeemPoints && parseInt(redeemPoints) > 0 && (
                <div style={{ fontSize: '13px', color: '#16a34a', marginTop: '4px' }}>
                  = €{(parseInt(redeemPoints) * 0.05).toFixed(2)} discount
                </div>
              )}
            </div>
            <button
              onClick={handleRedeem}
              disabled={redeeming || !redeemPoints || parseInt(redeemPoints) < 1}
              style={{ background: redeeming ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', fontWeight: '600', cursor: redeeming ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {redeeming ? 'Redeeming...' : 'Redeem Now'}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        {info?.transactions && info.transactions.length > 0 && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>
              📜 Transaction History
            </h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {info.transactions.map((tx, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{tx.description || tx.type}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: tx.points > 0 ? '#16a34a' : '#dc2626', fontSize: '16px' }}>
                    {tx.points > 0 ? '+' : ''}{tx.points} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loyalty;
