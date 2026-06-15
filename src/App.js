import './App.css';
import './MediaQueries.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './Pages/Home';
import About from './Pages/About';
import Locations from './Pages/Locations';
import Adventures from './Pages/Adventures';
import Contact from './Pages/Contact';
import FAQ from './Pages/FAQ';
import Payment from './Pages/Payment';
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentCancel from './Pages/PaymentCancel';
import TourManagement from './Pages/TourManagement';
import TourEditPage from './Pages/TourEditPage';
import ScrollToTop from './Components/ScrollToTop';
import Footer from './Components/Footer';
import GuideDashboardLayout from './layouts/GuideDashboardLayout';
import UserManagement from './Pages/guide/UserManagement';
import GuidePlaceholder from './Pages/guide/GuidePlaceholder';
import UserProfileDemo from './Pages/UserProfileDemo';

function AppRoutes() {
  const location = useLocation();
  const isGuideArea = location.pathname.startsWith('/guide');

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/guide" element={<GuideDashboardLayout />}>
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
        <Route path='/contact' element={<Contact/>} />
        <Route path='/faq' element={<FAQ/>} />
        <Route path='/payment' element={<Payment />} />
        <Route path='/payment/success' element={<PaymentSuccess />} />
        <Route path='/payment/cancel' element={<PaymentCancel />} />
        <Route path='/admin/tours' element={<TourManagement />} />
        <Route path='/admin/tours/:id' element={<TourEditPage />} />
        <Route path='/profile' element={<UserProfileDemo />} />
      </Routes>
      {!isGuideArea && <Footer />}
    </>
  );
}

function App() {
  return (
    <div>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
