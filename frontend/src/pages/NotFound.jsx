import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div className="glass-panel" style={styles.card}>
        <div style={styles.code}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.subtitle}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={styles.actions}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline"
            style={{ padding: '12px 28px' }}
          >
            ← Go Back
          </button>
          <Link to="/" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            Back to Home
          </Link>
          <Link to="/sessions" className="btn btn-secondary" style={{ padding: '12px 28px' }}>
            Browse Sessions
          </Link>
        </div>

        <div style={styles.divider} />

        <div style={styles.quickLinks}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '12px' }}>
            Quick links:
          </span>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/profile" style={styles.link}>Profile</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    position: 'relative',
    overflow: 'hidden',
  },
  glow1: {
    position: 'absolute', top: '-100px', left: '10%',
    width: '400px', height: '400px',
    background: 'radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)',
    zIndex: 0,
  },
  glow2: {
    position: 'absolute', bottom: '-100px', right: '10%',
    width: '400px', height: '400px',
    background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)',
    zIndex: 0,
  },
  card: {
    maxWidth: '540px',
    width: '100%',
    padding: '56px 48px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  code: {
    fontSize: '7rem',
    fontWeight: '900',
    fontFamily: 'Outfit, sans-serif',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1,
    letterSpacing: '-4px',
  },
  title: {
    fontSize: '1.8rem',
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: 0,
    maxWidth: '380px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '8px',
  },
  divider: {
    width: '100%',
    height: '1px',
    background: 'var(--border-glass)',
    margin: '8px 0',
  },
  quickLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  link: {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
};

export default NotFound;
