import './styles/global.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Locations from './pages/tour/Locations';
import Adventures from './pages/Adventures';
import TourDetail from './pages/tour/TourDetail';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Payment from './pages/payment/Payment';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentCancel from './pages/payment/PaymentCancel';
import AuthPage from './pages/auth/AuthPage';
import TourManagement from './pages/tour/TourManagement';
import TourEditPage from './pages/tour/TourEditPage';
import ScrollToTop from './components/common/ScrollToTop';
import Footer from './components/layout/Footer';
import GuideDashboardLayout from './layouts/GuideDashboardLayout';
import UserManagement from './pages/guide/UserManagement';
import GuidePlaceholder from './pages/guide/GuidePlaceholder';
import UserProfileDemo from './pages/UserProfileDemo';

import BookingHistory from './pages/BookingHistory';
import BookingDetail from './pages/BookingDetail';
import AiChatWidget from './components/ai/AiChatWidget';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppRoutes() {
  const location = useLocation();
  const isGuideArea = location.pathname.startsWith('/guide');
  const isAuthPage = location.pathname.startsWith('/auth');

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/guide"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <GuideDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UserManagement />} />
          <Route
            path="dashboard"
            element={
              <GuidePlaceholder
                title="Dashboard"
                description="Participant Management will be developed here."
              />
            }
          />
          <Route
            path="tours"
            element={
              <GuidePlaceholder
                title="Tours"
                description="Tour management will be developed here."
              />
            }
          />
          <Route
            path="analytics"
            element={
              <GuidePlaceholder
                title="Analytics"
                description="Analytics will be developed here."
              />
            }
          />
          <Route
            path="settings"
            element={
              <GuidePlaceholder
                title="Settings"
                description="Settings will be developed here."
              />
            }
          />
        </Route>
        <Route path="/" element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/locations' element={<Locations />} />
        <Route path='/adventures' element={<Adventures />} />
        <Route path='/tours/:idOrSlug' element={<TourDetail />} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/faq' element={<FAQ/>} />
        <Route
          path='/payment'
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route path='/payment/success' element={<PaymentSuccess />} />
        <Route path='/payment/cancel' element={<PaymentCancel />} />
        <Route
          path='/admin/tours'
          element={
            <ProtectedRoute roles={['GUIDE', 'ADMIN']}>
              <TourManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tours/:id'
          element={
            <ProtectedRoute roles={['GUIDE', 'ADMIN']}>
              <TourEditPage />
            </ProtectedRoute>
          }
        />
        <Route path='/bookings' element={<BookingHistory />} />
        <Route path='/bookings/:id' element={<BookingDetail />} />
        <Route path='/profile' element={<UserProfileDemo />} />
      </Routes>
      {!isGuideArea && !isAuthPage && <Footer />}
      {!isGuideArea && !isAuthPage && <AiChatWidget />}
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
