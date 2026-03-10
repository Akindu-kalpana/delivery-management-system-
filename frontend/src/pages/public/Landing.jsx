import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';

const Landing = () => {
  const { t } = useTranslation();
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Animated background circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full opacity-5 animate-ping"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Truck animation */}
          <div className="text-8xl mb-8 animate-bounce">🚚</div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition transform hover:scale-105 shadow-lg"
            >
              {t('hero.cta')}
            </Link>
            <Link 
              to="/track" 
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition transform hover:scale-105"
            >
              {t('hero.track')}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '500+', label: 'Deliveries Completed' },
              { number: '50+', label: 'Happy Clients' },
              { number: '3', label: 'Languages Supported' },
              { number: '24/7', label: 'Customer Support' },
            ].map((stat, index) => (
              <div key={index} className="reveal opacity-0 transition-all duration-700">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Why Choose Us?</h2>
          <p className="text-center text-gray-500 mb-16 text-lg">We make delivery simple, fast and accessible for everyone</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: '🤖', title: 'AI-Powered Booking', desc: 'Book your delivery by simply chatting with our AI assistant. No forms, no hassle.' },
              { icon: '🌍', title: 'Multilingual Support', desc: 'Use the system in English, Finnish, or Russian. We speak your language.' },
              { icon: '📍', title: 'Real-Time Tracking', desc: 'Track your delivery status in real time from pickup to delivery.' },
              { icon: '🔒', title: 'Secure & Reliable', desc: 'Your data is protected with JWT authentication and role-based access control.' },
              { icon: '⚡', title: 'Fast Delivery', desc: 'We ensure your packages are delivered quickly and safely across Finland.' },
              { icon: '📱', title: 'Easy to Use', desc: 'Simple and clean interface that works on all devices.' },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="reveal opacity-0 transition-all duration-700 bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:transform hover:-translate-y-2 transition-all border border-gray-100"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">How It Works</h2>
          <p className="text-center text-gray-500 mb-16 text-lg">Book a delivery in just a few simple steps</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '📝', title: 'Register', desc: 'Create your free account in seconds' },
              { step: '2', icon: '💬', title: 'Chat with AI', desc: 'Tell our chatbot what you need to deliver' },
              { step: '3', icon: '✅', title: 'Confirm', desc: 'Review the details and confirm your booking' },
              { step: '4', icon: '🚚', title: 'Track', desc: 'Track your delivery in real time' },
            ].map((item, index) => (
              <div key={index} className="reveal opacity-0 transition-all duration-700 text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-blue-300 -translate-x-8"></div>
                  )}
                </div>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Ship?</h2>
          <p className="text-xl text-blue-100 mb-10">Join hundreds of satisfied customers and start booking deliveries today.</p>
          <Link 
            to="/register" 
            className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-xl hover:bg-blue-50 transition transform hover:scale-105 shadow-lg inline-block"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-2xl font-bold text-white mb-4">🚚 NKR Delivery</div>
          <p className="mb-4">Nopeiden Kuljetusten Ritarit AY</p>
          <div className="flex justify-center space-x-6 mb-6">
            <Link to="/about" className="hover:text-white transition">About</Link>
            <Link to="/services" className="hover:text-white transition">Services</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
            <Link to="/track" className="hover:text-white transition">Track</Link>
          </div>
          <p className="text-sm">© 2025 Nopeiden Kuljetusten Ritarit AY. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;