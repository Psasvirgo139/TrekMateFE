/**Important Imports useful in code */
import React,{ useState, useEffect, useRef} from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/*Data Import */
import { destinations, slides } from "../Data";

/**Image Import */
import aboutImg from '../Images/home-about.webp';
import storyVector from '../Images/india-stories-vector.png';
import locationVector from '../Images/location-grid-vector.png';
import aeroplaneicon from '../Images/plane.png';

/**Component Import */
import Sidebar from "../Components/Sidebar";

const Home=()=>{
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const [openSidebar, setOpenSidebar] = useState(false);

  const heroRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      {
        threshold: 0.2,
      }
    );

    if (heroRef.current) observer.observe(heroRef.current);

    return () => observer.disconnect();
  }, []);
    return(
        <>
        <section
          ref={heroRef}
      className="hero"
      style={{ backgroundImage: `url(${slides[index].image})` }}
    >
      {/* Overlay */}
      <div className="overlay" />
      
      {/* Header */}
    
        <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
  <div className="header-inner">
      <Link to='/'><h1 className="logo">IndiVoyage</h1></Link>

    <div className="menu-btn" onClick={() => setOpenSidebar(true)}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</header>
   

      {/* Center Content */}
      <div className="hero-content">
         <p>{slides[index].subtext}</p>
        <h2>{slides[index].heading}</h2>
      </div>
    </section>

    <Sidebar open={openSidebar} setOpen={setOpenSidebar} />

      
      {/**India's Story come alive section */}

      <div className="white-bg-wrapper">
      <div className="home-about-section">

        {/* IMAGE SECTION */}
        <motion.div
          className="img-section"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <img src={aboutImg} alt=" Heritage and adventures, curated for your journey" />
        </motion.div>

        {/* TEXT SECTION */}
        <motion.div
          className="text-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.8,
                ease: "easeOut",
                staggerChildren: 0.15
              }
            }
          }}
        >
          <motion.h3
            className="section-subheading"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            Heritage and adventures, curated for your journey
          </motion.h3>

          <motion.h2
            className="section-heading"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            Where India’s Stories Come Alive
          </motion.h2>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
           Heritage and adventures, curated for your journey. Where India’s stories come alive. Discover India through an immersive gateway designed to connect you with the nation’s most iconic landscapes, cultures, and experiences. Every region holds a narrative—ancient temples whispering centuries of history, bustling markets alive with color and tradition, tranquil coastlines offering moments of serenity, and thrilling adventures that awaken your spirit of exploration. This platform brings all these elements together in a thoughtfully designed, seamless interface that intuitively adapts to your interests and travel style. Whether you’re drawn to timeless heritage, modern adventures, natural wonders, or hidden gems tucked away from the usual paths, you’ll find a curated journey crafted to help you explore India with depth, clarity, and a renewed sense of wonder. Let every destination inspire you, guide you, and draw you closer to the true essence of India—rich, diverse, and endlessly captivating.
          </motion.p>

          <motion.h3
            className="bottom-btns-heading"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            Handpicked journeys that blend heritage with thrill.
          </motion.h3>

          <motion.ul
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {[
    { label: "Jaipur, Rajasthan", path: "/" },
    { label: "Rishikesh, Uttarakhand", path: "/l" },
    { label: "Leh, Ladakh", path: "/" },
    { label: "Spiti Valley, Himachal Pradesh", path: "/" },
    { label: "Varanasi, Uttar Pradesh", path: "/" }
  ].map((item, index) => (
    <motion.li
      key={index}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    >
      <Link to={item.path}>{item.label}</Link>
    </motion.li>
  ))}
</motion.ul>
        </motion.div>
         <img src={storyVector} alt="" className="vector-img-home-about" />
                <img src={aeroplaneicon} alt="" className="plane-img-1" />
                <img src={aeroplaneicon} alt="" className="plane-img-2" />
      </div>
      </div>


      {/**Destinations Section */}
  <div className="destinations-section">

    {/* HEADINGS */}
    <motion.h3
      className="section-subheading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      Discover Iconic Destinations
    </motion.h3>

    <motion.h2
      className="section-heading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      Explore India Through Every Lens
    </motion.h2>

   
    <div className="destinations-cards">
      {destinations.slice(0,3).map((i, index) => (
          <Link
              to="/"
              key={index}
              className="destination-card"
            >
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: index * 0.12 }}
          viewport={{ once: true, amount: 0.2 }}
        >

          <motion.img
            src={i.img}
            alt={i.title}
            initial={{ scale: 1.05, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
          />

          <div
            className="card-content"
          >
            <h3 className="section-heading">{i.title}</h3>
            <p>{i.desc}</p>
          </div>

        </motion.div>
        </Link>
      ))}
      
    </div>
       <img src={locationVector} alt="" className="vector-img-location" />
                <img src={aeroplaneicon} alt="" className="plane-img-1-location" />
                <img src={aeroplaneicon} alt="" className="plane-img-2-location" />
  </div>
      </>
    )
}

export default Home;