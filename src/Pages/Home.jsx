import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvUUzjhxn8orAI_ijOd4idjPXhRQk11CgEtlhqTDP8dTzjLQCFA0TOVxbsgHSZowz0wJX8bqs8bkqS2O-rajIZOsGXmBBgiWs8Mk3Y_cx4wAxO1xf-b9dG1PR0ZdJ6m-ja2lcrYq7ZvReev_dYJKdA9FMxT38ZHwT9SKLF4dMESGfBTXnWPzIWBxH57zvGSUx4WovbnOf5frv95va0NECUYmgTDjQP2TvucjT_9NA3M9k7M7hidjEAD10NYM56JtmZWifulkNhGFk";

const Home = () => {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <Link to="/" className="home-brand">
            TrekMate Danang
          </Link>

          <nav className="home-nav">
            <Link to="/" className="home-nav-link active">
              Home
            </Link>
            <Link to="/locations" className="home-nav-link">
              Tours
            </Link>
            <Link to="/about" className="home-nav-link">
              About Us
            </Link>
            <Link to="/contact" className="home-nav-link">
              Contact
            </Link>
            <Link to="/payment" className="home-nav-link">
              Payment
            </Link>
            <Link to="/admin/tours" className="home-nav-link">
              Tour Management
            </Link>
          </nav>

          <Link to="/payment" className="home-button primary-button">
            Book Now
          </Link>
        </div>
      </header>

      <main className="home-main">
        <section className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay" />
          <div className="hero-copy">
            <span className="hero-eyebrow">Central Vietnam’s Premier Trekking Partner</span>
            <h1>Welcome to TrekMate</h1>
            <p>
              Precision logistics for rugged exploration. We manage every detail of your
              high-altitude itinerary so you can focus on the ascent.
            </p>
            <div className="hero-actions">
              <Link to="/contact" className="home-button primary-button">
                Start Planning
              </Link>
              <Link to="/locations" className="home-button secondary-button">
                View Itineraries
              </Link>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          <div className="feature-card feature-card-large">
            <div className="feature-card-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3L2 20h20L12 3z" />
              </svg>
            </div>
            <h2>Elite Terrain Mapping</h2>
            <p>
              Our guides utilize proprietary topological data to craft routes that balance
              challenge with logistical safety.
            </p>
            <Link to="/locations" className="feature-link">
              Learn more <span>→</span>
            </Link>
          </div>

          <div className="feature-card feature-card-small feature-card-dark">
            <div className="feature-card-icon feature-card-icon-contrast">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z" />
              </svg>
            </div>
            <h3>Safety Protocols</h3>
            <p>Military-grade safety equipment and real-time communication networks for every team.</p>
          </div>

          <div className="feature-card feature-card-small feature-card-light">
            <div className="feature-card-icon feature-card-icon-primary">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4Z" />
              </svg>
            </div>
            <h3>Expert Guides</h3>
            <p>Vetted locals with deep knowledge of the Central Vietnam highlands and survival logistics.</p>
          </div>

          <div className="feature-card feature-card-callout">
            <div>
              <h2>Ready for the Jungle?</h2>
              <p>Custom logistics for solo explorers or corporate team building.</p>
            </div>
            <Link to="/contact" className="home-button tertiary-button">
              Inquire Now
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
