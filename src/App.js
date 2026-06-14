import './App.css';
import './MediaQueries.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import About from './Pages/About';
import Locations from './Pages/Locations';
import Adventures from './Pages/Adventures';
import TourDetail from './Pages/TourDetail';
import Contact from './Pages/Contact';
import FAQ from './Pages/FAQ';
import Payment from './Pages/Payment';
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentCancel from './Pages/PaymentCancel';
import ScrollToTop from './Components/ScrollToTop';
import Footer from './Components/Footer';


function App() {
  return (
   <div>
       <BrowserRouter>
     <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/locations' element={<Locations />} />
        <Route path='/adventures' element={<Adventures />} />
        <Route path='/tours/:idOrSlug' element={<TourDetail />} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/faq' element={<FAQ/>} />
        <Route path='/payment' element={<Payment />} />
        <Route path='/payment/success' element={<PaymentSuccess />} />
        <Route path='/payment/cancel' element={<PaymentCancel />} />
      </Routes>
      <Footer />
    </BrowserRouter>
    </div>
  );
}

export default App;
