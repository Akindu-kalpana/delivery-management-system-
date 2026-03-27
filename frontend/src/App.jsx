import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PWAPrompt from './components/PWAPrompt';

// Public pages
import Landing from './pages/public/Landing';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Contact from './pages/public/Contact';
import PublicTracking from './pages/public/PublicTracking';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User pages
import UserDashboard from './pages/user/Dashboard';
import BookDelivery from './pages/user/BookDelivery';
import TrackDelivery from './pages/user/TrackDelivery';
import DeliveryHistory from './pages/user/DeliveryHistory';
import PriceEstimate from './pages/user/PriceEstimate';
import SavedAddresses from './pages/user/SavedAddresses';
import Complaints from './pages/user/Complaints';
import DamageClaim from './pages/user/DamageClaim';
import BulkOrders from './pages/user/BulkOrders';
import Loyalty from './pages/user/Loyalty';
import Invoice from './pages/user/Invoice';

// Driver pages
import DriverDashboard from './pages/driver/Dashboard';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/track" element={<PublicTracking />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User routes */}
      <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/book" element={<ProtectedRoute role="user"><BookDelivery /></ProtectedRoute>} />
      <Route path="/user/track" element={<ProtectedRoute role="user"><TrackDelivery /></ProtectedRoute>} />
      <Route path="/user/history" element={<ProtectedRoute role="user"><DeliveryHistory /></ProtectedRoute>} />
      <Route path="/user/price-estimate" element={<ProtectedRoute role="user"><PriceEstimate /></ProtectedRoute>} />
      <Route path="/user/addresses" element={<ProtectedRoute role="user"><SavedAddresses /></ProtectedRoute>} />
      <Route path="/user/complaints" element={<ProtectedRoute role="user"><Complaints /></ProtectedRoute>} />
      <Route path="/user/damage-claim" element={<ProtectedRoute role="user"><DamageClaim /></ProtectedRoute>} />
      <Route path="/user/bulk-orders" element={<ProtectedRoute role="user"><BulkOrders /></ProtectedRoute>} />
      <Route path="/user/loyalty" element={<ProtectedRoute role="user"><Loyalty /></ProtectedRoute>} />
      <Route path="/user/invoice/:id" element={<ProtectedRoute role="user"><Invoice /></ProtectedRoute>} />

      {/* Driver routes */}
      <Route path="/driver/dashboard" element={<ProtectedRoute role="driver"><DriverDashboard /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <PWAPrompt />
      </Router>
    </AuthProvider>
  );
}

export default App;
