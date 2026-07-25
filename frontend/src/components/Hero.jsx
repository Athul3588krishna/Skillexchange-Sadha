import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <div style={styles.heroSection}>
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>
      <div className="container" style={styles.container}>
        <div style={styles.badgeWrapper}>
          <span className="badge badge-primary text-glow" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
            ✨ Real-time Skill Sharing & Mentorship
          </span>
        </div>
        
        <h1 style={styles.title}>
          Master New Skills Through <br />
          <span className="gradient-text">Direct Exchange</span> & Paid Mentors
        </h1>
        
        <p style={styles.subtitle}>
          Learn directly from experienced practitioners, swap skills with peers for free, or book sessions with verified professional mentors. All in one interactive collaborative space.
        </p>

        <div style={styles.actions}>
          {user ? (
            <Link to="/sessions" className="btn btn-primary" style={styles.btnLarge}>
              Browse Classes & Mentors ➔
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary" style={styles.btnLarge}>
                Get Started Today
              </Link>
              <Link to="/sessions" className="btn btn-outline" style={styles.btnLarge}>
                Explore Sessions
              </Link>
            </>
          )}
        </div>

        <div style={styles.statsContainer} className="glass-panel">
          <div style={styles.statItem}>
            <h3 style={styles.statVal}>5,000+</h3>
            <p style={styles.statLabel}>Active Learners</p>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <h3 style={styles.statVal}>120+</h3>
            <p style={styles.statLabel}>Verified Mentors</p>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <h3 style={styles.statVal}>15+</h3>
            <p style={styles.statLabel}>Skill Categories</p>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <h3 style={styles.statVal}>$0</h3>
            <p style={styles.statLabel}>Direct Swaps cost</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  heroSection: {
    position: 'relative',
    padding: '80px 0 60px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    overflow: 'hidden'
  },
  glow1: {
    position: 'absolute',
    top: '-150px',
    left: '10%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(45,106,79,0.06) 0%, rgba(0,0,0,0) 70%)',
    zIndex: -1
  },
  glow2: {
    position: 'absolute',
    bottom: '-100px',
    right: '10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(212,163,115,0.08) 0%, rgba(0,0,0,0) 70%)',
    zIndex: -1
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  badgeWrapper: {
    marginBottom: '24px',
    animation: 'float 3s ease-in-out infinite'
  },
  title: {
    fontSize: '3.6rem',
    lineHeight: '1.15',
    marginBottom: '24px',
    maxWidth: '850px',
    color: 'var(--text-primary)',
    '@media (max-width: 768px)': {
      fontSize: '2.4rem'
    }
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
    maxWidth: '700px',
    marginBottom: '40px',
    lineHeight: '1.7'
  },
  actions: {
    display: 'flex',
    gap: '16px',
    marginBottom: '60px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  btnLarge: {
    padding: '14px 32px',
    fontSize: '1.05rem'
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '30px 40px',
    width: '100%',
    maxWidth: '800px',
    gap: '20px',
    flexWrap: 'wrap',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-glass)'
  },
  statItem: {
    flex: '1',
    minWidth: '120px'
  },
  statVal: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'Outfit, sans-serif',
    marginBottom: '4px'
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem'
  },
  statDivider: {
    width: '1px',
    background: 'var(--border-glass)',
    alignSelf: 'stretch',
    '@media (max-width: 600px)': {
      display: 'none'
    }
  }
};

// Add float keyframes helper
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
      100% { transform: translateY(0px); }
    }
    @media (max-width: 768px) {
      h1[style*="font-size: 3.6rem"] {
        font-size: 2.2rem !important;
      }
      p[style*="font-size: 1.2rem"] {
        font-size: 1rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Hero;
