import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/Navbar';

const Landing = () => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({ deliveries: 0, clients: 0, languages: 0 });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          animateCounter('deliveries', 500, 2000);
          animateCounter('clients', 50, 2000);
          animateCounter('languages', 4, 1000);
        }
      },
      { threshold: 0.5 }
    );
    if (statsRef.current) statsObserver.observe(statsRef.current);
    return () => statsObserver.disconnect();
  }, [statsAnimated]);

  const animateCounter = (key, target, duration) => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(prev => ({ ...prev, [key]: Math.floor(eased * target) }));
      if (progress === 1) clearInterval(timer);
    }, 16);
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc', overflow: 'hidden'}}>
      <Navbar />

      {/* Hero Section */}
      <section className="animated-bg" style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>

        {/* Particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{
            width: `${Math.random() * 100 + 40}px`,
            height: `${Math.random() * 100 + 40}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${Math.random() * 4 + 4}s`
          }}/>
        ))}

        {/* Glowing circles */}
        <div style={{position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'float 6s ease-in-out infinite'}}></div>
        <div style={{position: 'absolute', bottom: '10%', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', animation: 'float 8s ease-in-out infinite reverse'}}></div>

        <div style={{position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 20px', maxWidth: '900px', margin: '0 auto'}}>

          {/* Badge */}
          <div className="glass hero-title" style={{display: 'inline-block', padding: '8px 20px', borderRadius: '50px', marginBottom: '32px', fontSize: '14px', color: 'rgba(255,255,255,0.9)'}}>
            🇫🇮 {t('hero.badge')}
          </div>

          {/* Professional Delivery Drivers Walking */}
          <div className="hero-truck" style={{marginBottom: '24px', display: 'flex', justifyContent: 'center'}}>
            <svg width="520" height="215" viewBox="0 0 520 215" xmlns="http://www.w3.org/2000/svg" style={{maxWidth: '100%', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))'}}>
              <defs>
                <style>{`
                  .leg { transform-box: fill-box; transform-origin: 50% 0%; }
                  .fl  { animation: legF 0.65s ease-in-out infinite; }
                  .bl  { animation: legB 0.65s ease-in-out infinite; }
                  .fl2 { animation: legF 0.65s ease-in-out infinite 0.22s; }
                  .bl2 { animation: legB 0.65s ease-in-out infinite 0.22s; }
                  .fl3 { animation: legF 0.65s ease-in-out infinite 0.44s; }
                  .bl3 { animation: legB 0.65s ease-in-out infinite 0.44s; }
                  .bb1 { animation: bob 0.65s ease-in-out infinite; }
                  .bb2 { animation: bob 0.65s ease-in-out infinite 0.22s; }
                  .bb3 { animation: bob 0.65s ease-in-out infinite 0.44s; }
                  @keyframes legF { 0%,100%{transform:rotate(-24deg)} 50%{transform:rotate(24deg)} }
                  @keyframes legB { 0%,100%{transform:rotate(24deg)} 50%{transform:rotate(-24deg)} }
                  @keyframes bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
                `}</style>
              </defs>

              {/* Ground */}
              <line x1="0" y1="198" x2="520" y2="198" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="12,8"/>

              {/* Speed lines */}
              <line x1="8" y1="92"  x2="38" y2="92"  stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="5" y1="110" x2="30" y2="110" stroke="rgba(255,255,255,0.18)" strokeWidth="2"   strokeLinecap="round"/>
              <line x1="8" y1="128" x2="26" y2="128" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round"/>

              {/* ===== BIG BELLY DRIVER ===== */}
              <g transform="translate(98,20)">
                <g className="bb1">
                  <ellipse cx="0" cy="172" rx="36" ry="7" fill="rgba(0,0,0,0.18)"/>
                  {/* Navy delivery cap */}
                  <path d="M -21 -20 Q 0 -40 21 -20" fill="#1E3A8A"/>
                  <rect x="-21" y="-22" width="42" height="5" rx="1" fill="#172B6E"/>
                  <ellipse cx="5" cy="-19" rx="24" ry="5" fill="#0F1F52"/>
                  <rect x="-5" y="-32" width="10" height="8" rx="1.5" fill="#FCD34D"/>
                  <text x="0" y="-26" fontSize="5" fill="#1E3A8A" textAnchor="middle" fontWeight="bold">NKR</text>
                  {/* Head - light skin, balding */}
                  <circle cx="0" cy="1" r="22" fill="#FDBCB4"/>
                  <path d="M -22 4 Q -20 -9 -13 -14" stroke="#9CA3AF" strokeWidth="5" fill="none" strokeLinecap="round"/>
                  <path d="M  22 4 Q  20 -9  13 -14" stroke="#9CA3AF" strokeWidth="5" fill="none" strokeLinecap="round"/>
                  <ellipse cx="-23" cy="2" rx="5" ry="7" fill="#F0A090"/>
                  <ellipse cx=" 23" cy="2" rx="5" ry="7" fill="#F0A090"/>
                  <circle cx="-8" cy="-2" r="3.5" fill="#4B3621"/>
                  <circle cx=" 8" cy="-2" r="3.5" fill="#4B3621"/>
                  <circle cx="-7" cy="-3" r="1.4" fill="white"/>
                  <circle cx=" 9" cy="-3" r="1.4" fill="white"/>
                  <path d="M -12 -7 Q -8 -9 -4 -7" stroke="#9CA3AF" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M  4 -7 Q  8 -9 12 -7" stroke="#9CA3AF" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M -8 8 Q 0 16 8 8" stroke="#C06060" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <circle cx="-13" cy="7" r="5" fill="#FF9999" opacity="0.3"/>
                  <circle cx=" 13" cy="7" r="5" fill="#FF9999" opacity="0.3"/>
                  <rect x="-8" y="21" width="16" height="13" rx="5" fill="#FDBCB4"/>
                  {/* Navy uniform - big belly ellipse */}
                  <ellipse cx="0" cy="80" rx="42" ry="50" fill="#1D4ED8"/>
                  <path d="M -11 34 L 0 46 L 11 34" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <line x1="0" y1="46" x2="0" y2="116" stroke="rgba(255,255,255,0.28)" strokeWidth="2"/>
                  <circle cx="0" cy="56" r="2" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="0" cy="68" r="2" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="0" cy="80" r="2" fill="rgba(255,255,255,0.6)"/>
                  {/* ID badge */}
                  <rect x="-38" y="44" width="24" height="16" rx="2" fill="white" opacity="0.92"/>
                  <text x="-26" y="55" fontSize="6.5" fill="#1E3A8A" textAnchor="middle" fontWeight="bold">NKR</text>
                  <rect x="-38" y="57" width="24" height="3" rx="1" fill="#BFDBFE" opacity="0.8"/>
                  {/* Belt */}
                  <rect x="-38" y="118" width="76" height="8" rx="4" fill="#111"/>
                  <rect x="-5" y="118" width="10" height="8" rx="2" fill="#374151"/>
                  <rect x="-2" y="119" width="4" height="6" rx="1" fill="#9CA3AF"/>
                  {/* Cardboard package */}
                  <g transform="translate(-85,10)">
                    <rect x="0" y="0" width="40" height="32" rx="3" fill="#C8903C"/>
                    <rect x="0" y="0" width="40" height="32" rx="3" fill="#D4A055" opacity="0.5"/>
                    <rect x="0" y="0" width="40" height="5" rx="1" fill="#8B6914"/>
                    <line x1="20" y1="5" x2="20" y2="32" stroke="#8B6914" strokeWidth="2"/>
                    <line x1="0" y1="18" x2="40" y2="18" stroke="#A0701A" strokeWidth="1" opacity="0.6"/>
                    <rect x="6" y="20" width="28" height="9" rx="1" fill="white" opacity="0.7"/>
                    <text x="20" y="27" fontSize="5.5" fill="#1E3A8A" textAnchor="middle" fontWeight="bold">NKR DELIVERY</text>
                  </g>
                  {/* Left arm raised - navy sleeve + skin hand */}
                  <rect x="-50" y="34" width="13" height="34" rx="6" fill="#1D4ED8" transform="rotate(-52,-37,34)"/>
                  <ellipse cx="-58" cy="22" rx="7" ry="8" fill="#FDBCB4"/>
                  {/* Right arm at side - navy sleeve + skin hand */}
                  <rect x="40" y="46" width="13" height="30" rx="6" fill="#1D4ED8" transform="rotate(18,46,46)"/>
                  <ellipse cx="54" cy="76" rx="6" ry="7" fill="#FDBCB4"/>
                  {/* Dark navy trousers */}
                  <rect className="leg fl" x="-32" y="124" width="26" height="52" rx="13" fill="#0F172A"/>
                  <rect className="leg bl" x="6" y="124" width="26" height="52" rx="13" fill="#0F172A"/>
                  {/* Black polished shoes */}
                  <ellipse cx="-19" cy="176" rx="19" ry="7" fill="#111"/>
                  <ellipse cx=" 19" cy="176" rx="19" ry="7" fill="#111"/>
                  <ellipse cx="-24" cy="174" rx="7" ry="3" fill="rgba(255,255,255,0.12)"/>
                  <ellipse cx=" 14" cy="174" rx="7" ry="3" fill="rgba(255,255,255,0.12)"/>
                </g>
              </g>

              {/* ===== INDIAN / BROWN DRIVER ===== */}
              <g transform="translate(258,32)">
                <g className="bb2">
                  <ellipse cx="0" cy="155" rx="27" ry="6" fill="rgba(0,0,0,0.18)"/>
                  {/* Navy delivery cap */}
                  <path d="M -19 -19 Q 0 -36 19 -19" fill="#1E3A8A"/>
                  <rect x="-19" y="-21" width="38" height="5" rx="1" fill="#172B6E"/>
                  <ellipse cx="4" cy="-18" rx="22" ry="4.5" fill="#0F1F52"/>
                  <rect x="-4" y="-29" width="8" height="7" rx="1.5" fill="#FCD34D"/>
                  <text x="0" y="-24" fontSize="5" fill="#1E3A8A" textAnchor="middle" fontWeight="bold">NKR</text>
                  <rect x="-19" y="-14" width="6" height="10" rx="3" fill="#0D0500"/>
                  <rect x=" 13" y="-14" width="6" height="10" rx="3" fill="#0D0500"/>
                  {/* Head - brown skin */}
                  <circle cx="0" cy="2" r="19" fill="#C68642"/>
                  <ellipse cx="-20" cy="2" rx="4.5" ry="6.5" fill="#B5733A"/>
                  <ellipse cx=" 20" cy="2" rx="4.5" ry="6.5" fill="#B5733A"/>
                  <path d="M -11 -5 Q -6 -8 -1 -5" stroke="#1a0800" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M  1 -5 Q  6 -8 11 -5" stroke="#1a0800" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <circle cx="-6.5" cy="0" r="3.2" fill="#1a0800"/>
                  <circle cx=" 6.5" cy="0" r="3.2" fill="#1a0800"/>
                  <circle cx="-5.5" cy="-0.5" r="1.3" fill="white"/>
                  <circle cx=" 7.5" cy="-0.5" r="1.3" fill="white"/>
                  <path d="M -7 7 Q -3 10 0 8 Q 3 10 7 7" stroke="#1a0800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <path d="M -5 11 Q 0 16 5 11" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <rect x="-7" y="19" width="14" height="12" rx="5" fill="#C68642"/>
                  {/* Navy uniform shirt */}
                  <rect x="-21" y="31" width="42" height="62" rx="8" fill="#1D4ED8"/>
                  <path d="M -9 31 L 0 43 L 9 31" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <line x1="0" y1="43" x2="0" y2="93" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
                  <circle cx="0" cy="52" r="1.8" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="0" cy="63" r="1.8" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="0" cy="74" r="1.8" fill="rgba(255,255,255,0.6)"/>
                  {/* ID badge */}
                  <rect x="-20" y="42" width="19" height="13" rx="2" fill="white" opacity="0.92"/>
                  <text x="-10" y="51.5" fontSize="6" fill="#1E3A8A" textAnchor="middle" fontWeight="bold">NKR</text>
                  <rect x="-20" y="53" width="19" height="2" rx="1" fill="#BFDBFE" opacity="0.8"/>
                  {/* Belt */}
                  <rect x="-21" y="89" width="42" height="7" rx="3.5" fill="#111"/>
                  <rect x="-4" y="89" width="8" height="7" rx="2" fill="#374151"/>
                  <rect x="-2" y="90" width="4" height="5" rx="1" fill="#9CA3AF"/>
                  {/* Cardboard package */}
                  <g transform="translate(-58,18)">
                    <rect x="0" y="0" width="32" height="26" rx="3" fill="#C8903C"/>
                    <rect x="0" y="0" width="32" height="26" rx="3" fill="#D4A055" opacity="0.45"/>
                    <rect x="0" y="0" width="32" height="4" rx="1" fill="#8B6914"/>
                    <line x1="16" y1="4" x2="16" y2="26" stroke="#8B6914" strokeWidth="2"/>
                    <line x1="0" y1="15" x2="32" y2="15" stroke="#A0701A" strokeWidth="1" opacity="0.6"/>
                    <rect x="4" y="17" width="24" height="7" rx="1" fill="white" opacity="0.7"/>
                    <text x="16" y="23" fontSize="4.5" fill="#1E3A8A" textAnchor="middle" fontWeight="bold">NKR DELIVERY</text>
                  </g>
                  {/* Left arm + hand */}
                  <rect x="-34" y="38" width="12" height="28" rx="6" fill="#1D4ED8" transform="rotate(-30,-28,38)"/>
                  <ellipse cx="-42" cy="28" rx="6.5" ry="7" fill="#C68642"/>
                  {/* Right arm + hand */}
                  <rect x="21" y="40" width="12" height="26" rx="6" fill="#1D4ED8" transform="rotate(14,27,40)"/>
                  <ellipse cx="33" cy="66" rx="6" ry="6.5" fill="#C68642"/>
                  {/* Navy trousers */}
                  <rect x="-21" y="91" width="42" height="16" rx="4" fill="#0F172A"/>
                  <rect className="leg bl2" x="-19" y="105" width="18" height="46" rx="9" fill="#0F172A"/>
                  <rect className="leg fl2" x="1" y="105" width="18" height="46" rx="9" fill="#0F172A"/>
                  {/* Polished shoes */}
                  <ellipse cx="-10" cy="151" rx="15" ry="6" fill="#111"/>
                  <ellipse cx=" 10" cy="151" rx="15" ry="6" fill="#111"/>
                  <ellipse cx="-15" cy="149" rx="5" ry="2.5" fill="rgba(255,255,255,0.12)"/>
                  <ellipse cx=" 5" cy="149" rx="5" ry="2.5" fill="rgba(255,255,255,0.12)"/>
                </g>
              </g>

              {/* ===== LADY DRIVER - SHORT HAIR ===== */}
              <g transform="translate(418,40)">
                <g className="bb3">
                  <ellipse cx="0" cy="148" rx="23" ry="6" fill="rgba(0,0,0,0.18)"/>
                  {/* Navy delivery cap */}
                  <path d="M -17 -18 Q 0 -34 17 -18" fill="#1E3A8A"/>
                  <rect x="-17" y="-20" width="34" height="5" rx="1" fill="#172B6E"/>
                  <ellipse cx="4" cy="-17" rx="20" ry="4.5" fill="#0F1F52"/>
                  <rect x="-4" y="-27" width="8" height="6" rx="1.5" fill="#FCD34D"/>
                  <text x="0" y="-23" fontSize="5" fill="#1E3A8A" textAnchor="middle" fontWeight="bold">NKR</text>
                  {/* Short brown hair under cap */}
                  <rect x="-18" y="-12" width="6" height="14" rx="3" fill="#7B3F00"/>
                  <rect x=" 12" y="-12" width="6" height="14" rx="3" fill="#7B3F00"/>
                  <rect x="-13" y="14" width="26" height="8" rx="4" fill="#7B3F00"/>
                  {/* Head - light skin */}
                  <circle cx="0" cy="2" r="16" fill="#FDBCB4"/>
                  <ellipse cx="-17" cy="2" rx="4" ry="5.5" fill="#F0A090"/>
                  <ellipse cx=" 17" cy="2" rx="4" ry="5.5" fill="#F0A090"/>
                  {/* Silver stud earrings */}
                  <circle cx="-17" cy="5" r="2.5" fill="#D1D5DB"/>
                  <circle cx=" 17" cy="5" r="2.5" fill="#D1D5DB"/>
                  {/* Eyelashes */}
                  <line x1="-8" y1="-1.5" x2="-7.5" y2="-3.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="-5.5" y1="-2.5" x2="-5.5" y2="-4.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="-3" y1="-1.5" x2="-2.5" y2="-3.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1=" 3" y1="-1.5" x2=" 2.5" y2="-3.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1=" 5.5" y1="-2.5" x2=" 5.5" y2="-4.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1=" 8" y1="-1.5" x2=" 7.5" y2="-3.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round"/>
                  {/* Eyes */}
                  <circle cx="-5.5" cy="0" r="2.8" fill="#4B3621"/>
                  <circle cx=" 5.5" cy="0" r="2.8" fill="#4B3621"/>
                  <circle cx="-4.5" cy="-0.5" r="1.1" fill="white"/>
                  <circle cx=" 6.5" cy="-0.5" r="1.1" fill="white"/>
                  <path d="M -8.5 -4.5 Q -5.5 -6.5 -2.5 -4.5" stroke="#7B3F00" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  <path d="M  2.5 -4.5 Q  5.5 -6.5  8.5 -4.5" stroke="#7B3F00" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  <path d="M -5 8 Q 0 13 5 8" stroke="#D06070" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <circle cx="-10" cy="5" r="4" fill="#FF9999" opacity="0.28"/>
                  <circle cx=" 10" cy="5" r="4" fill="#FF9999" opacity="0.28"/>
                  <rect x="-5" y="17" width="10" height="10" rx="4" fill="#FDBCB4"/>
                  {/* Navy uniform shirt fitted */}
                  <rect x="-18" y="27" width="36" height="57" rx="7" fill="#1D4ED8"/>
                  <path d="M -7 27 L 0 38 L 7 27" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <line x1="0" y1="38" x2="0" y2="84" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
                  <circle cx="0" cy="47" r="1.8" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="0" cy="58" r="1.8" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="0" cy="69" r="1.8" fill="rgba(255,255,255,0.6)"/>
                  {/* ID badge */}
                  <rect x="-17" y="38" width="16" height="12" rx="2" fill="white" opacity="0.92"/>
                  <text x="-9" y="47" fontSize="5.5" fill="#1E3A8A" textAnchor="middle" fontWeight="bold">NKR</text>
                  <rect x="-17" y="48" width="16" height="2" rx="1" fill="#BFDBFE" opacity="0.8"/>
                  {/* Belt */}
                  <rect x="-18" y="82" width="36" height="6" rx="3" fill="#111"/>
                  <rect x="-3" y="82" width="6" height="6" rx="1.5" fill="#374151"/>
                  {/* Small cardboard package */}
                  <g transform="translate(-48,8)">
                    <rect x="0" y="0" width="26" height="22" rx="3" fill="#C8903C"/>
                    <rect x="0" y="0" width="26" height="22" rx="3" fill="#D4A055" opacity="0.45"/>
                    <rect x="0" y="0" width="26" height="4" rx="1" fill="#8B6914"/>
                    <line x1="13" y1="4" x2="13" y2="22" stroke="#8B6914" strokeWidth="1.5"/>
                    <line x1="0" y1="13" x2="26" y2="13" stroke="#A0701A" strokeWidth="1" opacity="0.6"/>
                    <rect x="3" y="14" width="20" height="6" rx="1" fill="white" opacity="0.7"/>
                    <text x="13" y="19" fontSize="4" fill="#1E3A8A" textAnchor="middle" fontWeight="bold">NKR</text>
                  </g>
                  {/* Left arm raised + hand */}
                  <rect x="-28" y="30" width="11" height="24" rx="5" fill="#1D4ED8" transform="rotate(-38,-22,30)"/>
                  <ellipse cx="-35" cy="20" rx="5.5" ry="6" fill="#FDBCB4"/>
                  {/* Right arm + hand */}
                  <rect x="16" y="32" width="11" height="22" rx="5" fill="#1D4ED8" transform="rotate(14,21,32)"/>
                  <ellipse cx="27" cy="54" rx="5.5" ry="6" fill="#FDBCB4"/>
                  {/* Navy trousers - straight professional */}
                  <rect x="-18" y="86" width="36" height="14" rx="4" fill="#0F172A"/>
                  <rect className="leg fl3" x="-16" y="98" width="14" height="44" rx="7" fill="#0F172A"/>
                  <rect className="leg bl3" x="2" y="98" width="14" height="44" rx="7" fill="#0F172A"/>
                  {/* Polished shoes */}
                  <ellipse cx="-9" cy="142" rx="12" ry="5" fill="#111"/>
                  <ellipse cx=" 9" cy="142" rx="12" ry="5" fill="#111"/>
                  <ellipse cx="-13" cy="140" rx="5" ry="2.5" fill="rgba(255,255,255,0.12)"/>
                  <ellipse cx=" 5" cy="140" rx="5" ry="2.5" fill="rgba(255,255,255,0.12)"/>
                </g>
              </g>
            </svg>
          </div>

          {/* Title */}
          <h1 className="hero-title gradient-text" style={{fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px'}}>
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle" style={{fontSize: 'clamp(16px, 3vw, 22px)', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6'}}>
            {t('hero.subtitle')}
          </p>

          {/* Buttons */}
          <div className="hero-buttons" style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/register" className="btn-hover" style={{background: 'white', color: '#1d4ed8', padding: '16px 36px', borderRadius: '50px', fontWeight: '700', fontSize: '16px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 30px rgba(0,0,0,0.2)'}}>
              🚀 {t('hero.cta')}
            </Link>
            <Link to="/track" className="btn-hover" style={{background: 'rgba(255,255,255,0.15)', color: 'white', padding: '16px 36px', borderRadius: '50px', fontWeight: '700', fontSize: '16px', textDecoration: 'none', display: 'inline-block', border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)'}}>
              📍 {t('hero.track')}
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator" style={{marginTop: '60px'}}>
            <div style={{width: '30px', height: '50px', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '15px', margin: '0 auto', display: 'flex', justifyContent: 'center', paddingTop: '8px'}}>
              <div style={{width: '4px', height: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: '2px', animation: 'fadeInUp 1s ease infinite'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} style={{background: 'white', padding: '80px 20px'}}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center'}}>
            {[
              { value: counts.deliveries + '+', label: t('landing.stats.deliveries'), icon: '📦', color: '#2563eb' },
              { value: counts.clients + '+', label: t('landing.stats.clients'), icon: '😊', color: '#7c3aed' },
              { value: counts.languages, label: t('landing.stats.languages'), icon: '🌍', color: '#059669' },
              { value: '24/7', label: t('landing.stats.support'), icon: '💬', color: '#dc2626' },
            ].map((stat, index) => (
              <div key={index} className={`reveal delay-${index + 1}`} style={{padding: '32px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #f1f5f9'}}>
                <div style={{fontSize: '40px', marginBottom: '12px'}}>{stat.icon}</div>
                <div style={{fontSize: '48px', fontWeight: '900', color: stat.color, marginBottom: '8px'}}>{stat.value}</div>
                <div style={{color: '#64748b', fontWeight: '500'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{background: '#f8fafc', padding: '80px 20px'}}>
        <div style={{maxWidth: '1100px', margin: '0 auto'}}>
          <div className="reveal" style={{textAlign: 'center', marginBottom: '60px'}}>
            <h2 style={{fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#1e293b', marginBottom: '16px'}}>{t('landing.features.title')}</h2>
            <p style={{color: '#64748b', fontSize: '18px', maxWidth: '600px', margin: '0 auto'}}>{t('landing.features.subtitle')}</p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'}}>
            {[
              { icon: '🤖', key: 'ai', color: '#2563eb' },
              { icon: '🌍', key: 'multilingual', color: '#7c3aed' },
              { icon: '📍', key: 'tracking', color: '#059669' },
              { icon: '🔒', key: 'secure', color: '#dc2626' },
              { icon: '⚡', key: 'fast', color: '#d97706' },
              { icon: '📱', key: 'everywhere', color: '#0891b2' },
            ].map((feature, index) => (
              <div key={index} className={`reveal card-hover delay-${index + 1}`} style={{background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderTop: `4px solid ${feature.color}`}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>{feature.icon}</div>
                <h3 style={{fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '12px'}}>{t(`landing.features.${feature.key}.title`)}</h3>
                <p style={{color: '#64748b', lineHeight: '1.7'}}>{t(`landing.features.${feature.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{background: 'white', padding: '80px 20px'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <div className="reveal" style={{textAlign: 'center', marginBottom: '60px'}}>
            <h2 style={{fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#1e293b', marginBottom: '16px'}}>{t('landing.howItWorks.title')}</h2>
            <p style={{color: '#64748b', fontSize: '18px'}}>{t('landing.howItWorks.subtitle')}</p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px'}}>
            {[
              { step: '01', icon: '📝', key: 'register', color: '#2563eb' },
              { step: '02', icon: '💬', key: 'chat', color: '#7c3aed' },
              { step: '03', icon: '✅', key: 'confirm', color: '#059669' },
              { step: '04', icon: '🚚', key: 'trackStep', color: '#dc2626' },
            ].map((item, index) => (
              <div key={index} className={`reveal delay-${index + 1}`} style={{textAlign: 'center', padding: '32px 20px'}}>
                <div style={{width: '64px', height: '64px', borderRadius: '50%', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', margin: '0 auto 16px'}}>
                  {item.step}
                </div>
                <div style={{fontSize: '40px', marginBottom: '12px'}}>{item.icon}</div>
                <h3 style={{fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px'}}>{t(`landing.howItWorks.${item.key}.title`)}</h3>
                <p style={{color: '#64748b', fontSize: '14px', lineHeight: '1.6'}}>{t(`landing.howItWorks.${item.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{background: '#f8fafc', padding: '80px 20px'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <div className="reveal" style={{textAlign: 'center', marginBottom: '60px'}}>
            <h2 style={{fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#1e293b', marginBottom: '16px'}}>{t('landing.testimonials.title')}</h2>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px'}}>
            {[
              { name: 'Mikko Virtanen', role: 'Business Owner', text: 'The AI chatbot made booking so easy. I just typed what I needed and it handled everything. Amazing!', avatar: '👨‍💼' },
              { name: 'Anna Korhonen', role: 'Regular Customer', text: 'I love that I can use it in Finnish. Finally a delivery service that speaks my language!', avatar: '👩‍💻' },
              { name: 'Ivan Petrov', role: 'Entrepreneur', text: 'Russian language support is perfect. The tracking feature is very accurate and reliable.', avatar: '👨‍🔧' },
            ].map((testimonial, index) => (
              <div key={index} className={`reveal card-hover delay-${index + 1}`} style={{background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize: '32px', marginBottom: '16px'}}>⭐⭐⭐⭐⭐</div>
                <p style={{color: '#475569', lineHeight: '1.7', marginBottom: '24px', fontStyle: 'italic'}}>"{testimonial.text}"</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{fontSize: '40px'}}>{testimonial.avatar}</div>
                  <div>
                    <div style={{fontWeight: '700', color: '#1e293b'}}>{testimonial.name}</div>
                    <div style={{color: '#64748b', fontSize: '14px'}}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="animated-bg" style={{padding: '100px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)'}}></div>
        <div style={{position: 'relative', zIndex: 1}}>
          <div className="reveal" style={{fontSize: '64px', marginBottom: '24px'}}>🚀</div>
          <h2 className="reveal gradient-text" style={{fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '900', marginBottom: '16px'}}>{t('landing.cta.title')}</h2>
          <p className="reveal" style={{color: 'rgba(255,255,255,0.8)', fontSize: '20px', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px'}}>
            {t('landing.cta.subtitle')}
          </p>
          <Link to="/register" className="btn-hover reveal" style={{background: 'white', color: '#1d4ed8', padding: '18px 48px', borderRadius: '50px', fontWeight: '800', fontSize: '18px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 30px rgba(0,0,0,0.2)'}}>
            {t('landing.cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background: '#0f172a', color: '#94a3b8', padding: '60px 20px 40px'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px'}}>
            <div>
              <div style={{fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '12px'}}>🚚 NKR Delivery</div>
              <p style={{lineHeight: '1.7', fontSize: '14px'}}>{t('landing.footer.description')}</p>
            </div>
            <div>
              <div style={{fontWeight: '700', color: 'white', marginBottom: '16px'}}>{t('landing.footer.quickLinks')}</div>
              {[
                [t('nav.home'), '/'],
                [t('nav.about'), '/about'],
                [t('nav.services'), '/services'],
                [t('nav.contact'), '/contact']
              ].map(([label, path]) => (
                <div key={path} style={{marginBottom: '8px'}}>
                  <Link to={path} style={{color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s'}}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#94a3b8'}
                  >{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontWeight: '700', color: 'white', marginBottom: '16px'}}>{t('landing.footer.contact')}</div>
              <div style={{fontSize: '14px', lineHeight: '2'}}>
                <div>📍 Oulu, Finland</div>
                <div>📞 +358 40 123 4567</div>
                <div>📧 info@nkrdelivery.fi</div>
              </div>
            </div>
            <div>
              <div style={{fontWeight: '700', color: 'white', marginBottom: '16px'}}>{t('landing.footer.languages')}</div>
              <div style={{fontSize: '14px', lineHeight: '2'}}>
                <div>🇬🇧 English</div>
                <div>🇫🇮 Finnish</div>
                <div>🇷🇺 Russian</div>
                <div>🇸🇪 Swedish</div>
              </div>
            </div>
          </div>
          <div style={{borderTop: '1px solid #1e293b', paddingTop: '24px', textAlign: 'center', fontSize: '13px'}}>
            {t('landing.footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
