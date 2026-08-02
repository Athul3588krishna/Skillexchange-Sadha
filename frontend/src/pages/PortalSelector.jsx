import React from 'react';
import { Link } from 'react-router-dom';

const PortalSelector = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 className="gradient-text" style={styles.mainTitle}>SkillExchange Portals</h1>
        <p style={styles.subTitle}>Select your portal to log in or create your specialized account</p>
      </div>

      <div style={styles.grid} className="grid-2">
        {/* Student Portal Card */}
        <div className="glass-panel-interactive" style={styles.card}>
          <div style={styles.iconWrapper} className="badge-primary">
            🎓
          </div>
          <h2 style={styles.cardTitle}>Student / Learner</h2>
          <p style={styles.cardDesc}>
            Join as a student to discover peer-to-peer skill swaps, book paid mentor courses, and track your learning progress.
          </p>
          <div style={styles.badgeGroup}>
            <span className="badge badge-primary">Free Skill Swaps</span>
            <span className="badge badge-secondary">Paid Mentorships</span>
          </div>
          <Link to="/student/login" className="btn btn-primary" style={styles.actionBtn}>
            Enter Student Portal →
          </Link>
        </div>

        {/* Mentor Portal Card */}
        <div className="glass-panel-interactive" style={styles.card}>
          <div style={{...styles.iconWrapper, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)'}}>
            👨‍🏫
          </div>
          <h2 style={styles.cardTitle}>Professional Mentor</h2>
          <p style={styles.cardDesc}>
            Apply as an instructor to host paid mentorship sessions and exchange knowledge. Certificate verification by Admin required.
          </p>
          <div style={styles.badgeGroup}>
            <span className="badge badge-warning">Admin Verification Required</span>
            <span className="badge badge-success">Earn & Teach</span>
          </div>
          <Link to="/mentor/login" className="btn btn-secondary" style={styles.actionBtn}>
            Enter Mentor Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    padding: '60px 24px',
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px'
  },
  mainTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '12px'
  },
  subTitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    maxWidth: '600px'
  },
  grid: {
    width: '100%',
    gap: '30px'
  },
  card: {
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: '20px'
  },
  iconWrapper: {
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.2rem',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '1.4rem',
    color: 'var(--text-primary)',
    marginBottom: '12px',
    fontWeight: '700'
  },
  cardDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.92rem',
    lineHeight: '1.6',
    marginBottom: '20px',
    flex: 1
  },
  badgeGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '24px'
  },
  actionBtn: {
    width: '100%',
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: '600'
  }
};

export default PortalSelector;
