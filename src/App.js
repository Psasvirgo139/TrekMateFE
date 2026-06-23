import './App.css';
import './MediaQueries.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import Home from './Pages/Home';
import About from './Pages/About';
import Locations from './Pages/Tour/Locations';
import Adventures from './Pages/Adventures';
import TourDetail from './Pages/Tour/TourDetail';
import Contact from './Pages/Contact';
import FAQ from './Pages/FAQ';
import Payment from './Pages/Payment';
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentCancel from './Pages/PaymentCancel';
import AuthPage from './Pages/auth/AuthPage';
import TourManagement from './Pages/Tour/TourManagement';
import TourEditPage from './Pages/Tour/TourEditPage';
import ScrollToTop from './Components/ScrollToTop';
import Footer from './Components/Footer';
import GuideDashboardLayout from './layouts/GuideDashboardLayout';
import UserManagement from './Pages/guide/UserManagement';
import GuidePlaceholder from './Pages/guide/GuidePlaceholder';
import UserProfileDemo from './Pages/UserProfileDemo';

import BookingHistory from './Pages/BookingHistory';
import BookingDetail from './Pages/BookingDetail';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

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
