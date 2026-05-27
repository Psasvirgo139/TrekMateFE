import './App.css';
import './MediaQueries.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import About from './Pages/About';
import Locations from './Pages/Locations';
import Adventures from './Pages/Adventures';
import Contact from './Pages/Contact';
import FAQ from './Pages/FAQ';
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
        <Route path='/contact' element={<Contact/>} />
        <Route path='/faq' element={<FAQ/>} />
      </Routes>
      <Footer />
    </BrowserRouter>
    </div>
  );
}

export default App;
