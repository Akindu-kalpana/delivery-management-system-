import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAPrompt = () => {
  // Service worker update prompt
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every hour
      if (r) setInterval(() => r.update(), 60 * 60 * 1000);
    },
  });

  // Install-to-home-screen prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-install-dismissed') === '1'
  );

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (!dismissed) setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    setShowInstall(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  const bannerStyle = {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1E3A8A',
    color: 'white',
    borderRadius: '14px',
    padding: '14px 20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    zIndex: 9999,
    maxWidth: '420px',
    width: 'calc(100vw - 32px)',
    fontSize: '14px',
  };

  return (
    <>
      {/* Update available banner */}
      {needRefresh && (
        <div style={bannerStyle}>
          <span style={{ fontSize: '22px' }}>🔄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>Update available</div>
            <div style={{ opacity: 0.85, fontSize: '12px' }}>A new version of NKR Delivery is ready.</div>
          </div>
          <button
            onClick={() => updateServiceWorker(true)}
            style={{ background: 'white', color: '#1E3A8A', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            Update
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Install to home screen banner */}
      {showInstall && !needRefresh && (
        <div style={bannerStyle}>
          <span style={{ fontSize: '22px' }}>📲</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>Install NKR Delivery</div>
            <div style={{ opacity: 0.85, fontSize: '12px' }}>Add to your home screen for the best experience.</div>
          </div>
          <button
            onClick={handleInstall}
            style={{ background: 'white', color: '#1E3A8A', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            Install
          </button>
          <button
            onClick={dismissInstall}
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default PWAPrompt;
