import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <Logo />
        {/* <h1>EduResume Pro</h1> */}
        <p>Create professional resumes easily</p>
      </header>

      <div className="home-content">
        <section className="cta-section">
          <h2>Welcome to EduResume Pro</h2>
          <p>Build your perfect resume and get hired</p>
          
          <div className="cta-buttons">
            <Link to="/signup" className="btn-primary">Get Started</Link>
            <Link to="/login" className="btn-secondary">Sign In</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
