import './styles/global.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Locations from './pages/tour/Locations';
import TourDetail from './pages/tour/TourDetail';
import TourBooking from './pages/tour/TourBooking';
import FAQ from './pages/FAQ';
import Payment from './pages/payment/Payment';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentCancel from './pages/payment/PaymentCancel';
import AuthPage from './pages/auth/AuthPage';
import TourManagement from './pages/tour/TourManagement';
import TourEditPage from './pages/tour/TourEditPage';
import GuideCalendar from './pages/tour/GuideCalendar';
import ScrollToTop from './components/common/ScrollToTop';
import Footer from './components/layout/Footer';
import GuideDashboardLayout from './layouts/GuideDashboardLayout';
import UserManagement from './pages/guide/UserManagement';
import GuidePlaceholder from './pages/guide/GuidePlaceholder';
import EquipmentManagement from './pages/guide/EquipmentManagement';
import Profile from './pages/Profile';
import TourLeading from './pages/guide/TourLeading';

import BookingHistory from './pages/BookingHistory';
import BookingDetail from './pages/BookingDetail';

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
          <Route path="equipment" element={<EquipmentManagement />} />
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
        <Route path='/about' element={<Navigate to="/" state={{ scrollTo: "about-section" }} replace />} />
        <Route path='/locations' element={<Locations />} />
        <Route path='/tours/:idOrSlug' element={<TourDetail />} />
        <Route
          path='/tours/:idOrSlug/book'
          element={
            <ProtectedRoute>
              <TourBooking />
            </ProtectedRoute>
          }
        />
        <Route path='/contact' element={<Navigate to="/" state={{ scrollTo: "contact-section" }} replace />} />
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
            <ProtectedRoute roles={['ADMIN']}>
              <TourManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tours/:id'
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <TourEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/guide-calendar'
          element={
            <ProtectedRoute roles={['GUIDE', 'ADMIN']}>
              <GuideCalendar />
            </ProtectedRoute>
          }
        />
        <Route path='/bookings' element={<BookingHistory />} />
        <Route path='/bookings/:id' element={<BookingDetail />} />
        <Route path='/profile' element={<Profile />} />
        <Route
          path='/tour-leading'
          element={
            <ProtectedRoute roles={['GUIDE']}>
              <TourLeading />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isGuideArea && !isAuthPage && <Footer />}
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
