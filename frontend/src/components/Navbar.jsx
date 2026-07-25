import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-nav" style={styles.nav}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🔄</span>
          <span className="gradient-text" style={styles.logoText}>SkillExchange</span>
        </Link>

        {/* Desktop Menu */}
        <div style={styles.menu}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/sessions" style={styles.navLink}>Browse Sessions</Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.navLinkAdmin}>Admin Dashboard</Link>
              )}
              {user.role === 'mentor' && (
                <Link to="/mentor" style={styles.navLinkMentor}>Mentor Dashboard</Link>
              )}
              {(user.role === 'beginner' || user.role === 'skilled_user') && (
                <Link to="/dashboard" style={styles.navLinkUser}>My Dashboard</Link>
              )}
              <Link to="/profile" style={styles.navLink}>Profile</Link>
              <div style={styles.userInfo}>
                <span style={styles.userBadge} className={`badge badge-${
                  user.role === 'admin' ? 'danger' : user.role === 'mentor' ? 'primary' : 'secondary'
                }`}>
                  {user.role.replace('_', ' ')}
                </span>
                <button onClick={handleLogout} className="btn btn-outline" style={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Get Started</Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          style={styles.mobileBtn} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={styles.mobileDrawer} className="glass-panel">
          <Link to="/" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/sessions" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Browse Sessions</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
              )}
              {user.role === 'mentor' && (
                <Link to="/mentor" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Mentor Dashboard</Link>
              )}
              {(user.role === 'beginner' || user.role === 'skilled_user') && (
                <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>
              )}
              <Link to="/profile" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                className="btn btn-danger" 
                style={{ width: '100%', marginTop: '16px' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={() => setMobileMenuOpen(false)}>
              Get Started
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border-glass)',
    padding: '16px 0'
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none'
  },
  logoIcon: {
    fontSize: '1.6rem'
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    fontFamily: 'Outfit, sans-serif',
    letterSpacing: '-0.03em'
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    '@media (max-width: 768px)': {
      display: 'none'
    }
  },
  navLink: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    cursor: 'pointer'
  },
  navLinkAdmin: {
    color: 'var(--danger)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  navLinkMentor: {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  navLinkUser: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderLeft: '1px solid var(--border-glass)',
    paddingLeft: '20px'
  },
  userBadge: {
    fontSize: '0.7rem'
  },
  logoutBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem'
  },
  mobileBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block'
    }
  },
  mobileDrawer: {
    position: 'absolute',
    top: '70px',
    left: '24px',
    right: '24px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-glass)'
  },
  mobileLink: {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '1.1rem',
    padding: '8px 0',
    borderBottom: '1px solid var(--border-glass)'
  }
};

// Add responsive media query support hack via inject style
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 768px) {
      .glass-nav div[style*="display: flex"][style*="gap: 24px"] {
        display: none !important;
      }
      .glass-nav button[style*="display: none"] {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Navbar;
