// src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import './HomePage.css';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`hero-section ${isVisible ? 'visible' : ''}`}
      >
        {/* Animated Background Elements */}
        <div className="background-elements">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>

        <div className="container">
          {/* Main Hero Content */}
          <main className="main-content">
            {/* Brand Header */}
            <div className="brand-header">
              <div className="logo-container">
                <span className="logo">⏳</span>
                <div className="logo-glow"></div>
              </div>
              <h1 className="brand-name">SoulBox</h1>
              <p className="brand-tagline">Where emotions rest in time, waiting to awaken</p>
            </div>

            {/* Animated Badge */}
            <div className="badge">
              <div className="badge-pulse"></div>
              <span className="badge-icon">✨</span>
              <span>Trusted by 10,000+ users worldwide</span>
            </div>

            {/* Main Heading */}
            <div className="heading-container">
              <h2 className="title">
                Preserve Your Most
                <span className="title-accent"> Precious Moments</span>
              </h2>
              
              <p className="subtitle">
                Create digital time capsules filled with messages, photos, and videos 
                that unlock at the perfect moment in the future. Secure, private, and 
                beautifully delivered to your future self or loved ones.
              </p>
            </div>

            {/* Stats Section */}
            <div className="stats">
              {[
                { number: "10K+", label: "Time Capsules", icon: "📦" },
                { number: "98%", label: "Success Rate", icon: "✅" },
                { number: "24/7", label: "Secure Storage", icon: "🔒" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="stat-item fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="btn-container">
              <Link 
                to="/create" 
                className="primary-btn"
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px) scale(1.02)';
                  e.target.style.boxShadow = '0 20px 40px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.2)';
                }}
              >
                <div className="btn-background"></div>
                <span className="btn-icon">✉️</span>
                Create Your First Capsule
                <span className="btn-arrow">→</span>
              </Link>
              
              <Link 
                to="/dashboard" 
                className="secondary-btn"
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.borderColor = 'rgba(168, 168, 255, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.borderColor = 'rgba(168, 168, 255, 0.3)';
                }}
              >
                <span className="btn-icon">📊</span>
                View Dashboard
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="trust-section">
              <div className="trust-text">Enterprise-grade security & reliability</div>
              <div className="security-badge">
                <span>🔒 Military-grade encryption</span>
                <span>📧 Automatic email delivery</span>
                <span>⏰ Precision timing</span>
                <span>🌐 Global access</span>
              </div>
            </div>
          </main>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" ref={featuresRef}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">How It Works</div>
            <h2 className="features-title">
              Preserve Memories in Four Simple Steps
            </h2>
            <p className="features-subtitle">
              From creation to delivery, we ensure your memories are safe and delivered perfectly
            </p>
          </div>
          
          <div className="features-grid">
            {[
              {
                icon: "📝",
                title: "Create & Compose",
                description: "Craft your heartfelt message, upload cherished photos, or record personal videos. Add titles, descriptions, and personalize your time capsule for the perfect future moment.",
                features: ["Text messages", "Photo uploads", "Video recordings", "Personal titles"]
              },
              {
                icon: "⏰",
                title: "Schedule Delivery",
                description: "Choose the exact date and time for your capsule to unlock. Set it for birthdays, anniversaries, graduations, or any special occasion in the future.",
                features: ["Precise timing", "AM/PM support", "Future dates", "Special occasions"]
              },
              
              {
                icon: "🚀",
                title: "Automatic Delivery",
                description: "We automatically deliver your capsule via email at the scheduled time. Recipients receive a beautiful, accessible link to unlock their memories.",
                features: ["Email delivery", "Beautiful templates", "Mobile access", "Instant notifications"]
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="feature-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.3)';
                }}
              >
                <div className="feature-icon-container">
                  <div className="feature-icon-bg"></div>
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <div className="feature-step">{index + 1}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
                <div className="feature-list">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="feature-list-item">
                      <span className="feature-list-icon">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">Testimonials</div>
            <h2 className="features-title">What Our Users Say</h2>
          </div>
          <div className="testimonials-grid">
            {[
              {
                text: "I sent a capsule to my future self on my graduation day. When it unlocked, it was like receiving a letter from my past self. Magical!",
                author: "Sarah Chen",
                role: "University Student"
              },
              {
                text: "Used SoulBox to send birthday messages to my kids for the next 5 years. Best decision ever - they love the surprise each year!",
                author: "Michael Rodriguez",
                role: "Parent"
              },
              {
                text: "As a writer, I time-capsule my story ideas. When they unlock months later, it's like finding hidden treasure I forgot about.",
                author: "Emily Watson",
                role: "Author"
              }
            ].map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-text">"{testimonial.text}"</div>
                <div className="testimonial-author">
                  <strong>{testimonial.author}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Preserve Your Memories?</h2>
            <p className="cta-subtitle">
              Join thousands of users who trust SoulBox with their most precious moments. 
              Start your time capsule journey today.
            </p>
            <Link 
              to="/signup" 
              className="cta-button"
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 35px rgba(255, 215, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.2)';
              }}
            >
              <span className="btn-icon">🚀</span>
              Start Free Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo">⏳</span>
                <span className="footer-brand-name">SoulBox</span>
              </div>
              <p className="footer-description">
                Preserving your most precious moments for the future. 
                Secure, reliable, and beautifully simple time capsule service.
              </p>
              <div className="social-links">
                {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                  <a key={social} href="#" className="social-link">
                    {social}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4 className="footer-heading">Product</h4>
                {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
                  <a key={item} href="#" className="footer-link">{item}</a>
                ))}
              </div>
              <div className="footer-column">
                <h4 className="footer-heading">Company</h4>
                {['About Us', 'Our Story', 'Careers', 'Contact'].map((item) => (
                  <a key={item} href="#" className="footer-link">{item}</a>
                ))}
              </div>
              <div className="footer-column">
                <h4 className="footer-heading">Support</h4>
                {['Help Center', 'Privacy Policy', 'Terms of Service', 'Security'].map((item) => (
                  <a key={item} href="#" className="footer-link">{item}</a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="copyright">
              © 2024 SoulBox. All rights reserved. | Preserving memories, one capsule at a time.
            </div>
            <div className="footer-legal">
              <a href="#" className="legal-link">Privacy Policy</a>
              <a href="#" className="legal-link">Terms of Service</a>
              <a href="#" className="legal-link">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}