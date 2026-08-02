import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MentorAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, register, error: authError } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'mentor' || user.mentorStatus === 'pending' || user.mentorStatus === 'approved') {
        navigate('/mentor');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [skillsToTeach, setSkillsToTeach] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setLocalError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        toast.success('Welcome back to Mentor Dashboard');
      } else {
        setLocalError(res.message || 'Login failed');
      }
    } else {
      if (!name || !email || !password || !certificateUrl) {
        setLocalError('Please fill in all required fields, including your certificate');
        setLoading(false);
        return;
      }

      const teachArr = skillsToTeach ? skillsToTeach.split(',').map(s => s.trim()).filter(s => s) : [];
      const certsArr = certificateUrl ? [certificateUrl.trim()] : [];

      const userData = {
        name,
        email,
        password,
        role: 'mentor', // Registering as mentor -> backend sets mentorStatus: 'pending'
        bio,
        skillsToTeach: teachArr,
        certificates: certsArr
      };

      const res = await register(userData);
      setLoading(false);
      if (res.success) {
        toast.info('Mentor Application submitted! Sent for Admin Approval.');
        navigate('/mentor');
      } else {
        setLocalError(res.message || 'Registration failed');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel">
        <div style={styles.header}>
          <span style={styles.portalBadge} className="badge badge-warning">👨‍🏫 Mentor Portal</span>
          <h2 style={styles.title}>{isLogin ? 'Mentor Sign In' : 'Apply as Professional Mentor'}</h2>
          <p style={styles.subtitle}>
            {isLogin ? 'Manage your teaching schedule and active sessions' : 'Host paid mentorship courses and teach students'}
          </p>
        </div>

        {/* Toggle Pills */}
        <div style={styles.toggleWrapper}>
          <button 
            style={{...styles.toggleBtn, ...(isLogin ? styles.activeToggle : {})}} 
            onClick={() => { setIsLogin(true); setLocalError(''); }}
          >
            Sign In
          </button>
          <button 
            style={{...styles.toggleBtn, ...(!isLogin ? styles.activeToggle : {})}} 
            onClick={() => { setIsLogin(false); setLocalError(''); }}
          >
            Apply as Mentor
          </button>
        </div>

        {(localError || authError) && (
          <div style={styles.errorAlert} className="badge-danger">
            ⚠️ {localError || authError}
          </div>
        )}

        {!isLogin && (
          <div style={styles.noticeBox}>
            <span style={{ fontSize: '1.1rem' }}>⏳</span>
            <div>
              <strong>Admin Verification Required:</strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Upon registration, your mentor application will be submitted for Admin review. Course publishing will unlock once approved.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Dr. Sarah Jenkins"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="sarah@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Biography & Expertise</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Summarize your professional experience and teaching domain..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills You Teach (Comma-separated) *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={skillsToTeach} 
                  onChange={(e) => setSkillsToTeach(e.target.value)} 
                  placeholder="Full-Stack Web Dev, Data Science, AWS"
                  required
                />
              </div>

              <div className="form-group" style={styles.certBlock}>
                <label className="form-label" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                  Professional Certificate Verification *
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={certificateUrl} 
                  onChange={(e) => setCertificateUrl(e.target.value)} 
                  placeholder="Certificate Name, ID, or Verification URL (e.g. AWS Certified Solution Architect)"
                  required
                />
                <p style={styles.certHelp}>
                  Required for Admin review before your paid sessions can be listed.
                </p>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-secondary" 
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In as Mentor' : 'Submit Mentor Application'}
          </button>
        </form>

        <div style={styles.footerLink}>
          <span>Looking to learn? </span>
          <Link to="/student/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Go to Student Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px'
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    padding: '36px',
    border: '1px solid var(--border-glass)',
    borderRadius: '20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  portalBadge: {
    fontSize: '0.8rem',
    marginBottom: '10px'
  },
  title: {
    fontSize: '1.6rem',
    color: 'var(--text-primary)',
    fontWeight: '700',
    marginTop: '6px'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    marginTop: '4px'
  },
  toggleWrapper: {
    display: 'flex',
    background: 'var(--bg-secondary)',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '24px',
    border: '1px solid var(--border-glass)'
  },
  toggleBtn: {
    flex: '1',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.2s ease'
  },
  activeToggle: {
    background: 'var(--secondary)',
    color: 'white',
    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
  },
  errorAlert: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.85rem'
  },
  noticeBox: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '10px',
    fontSize: '0.85rem',
    marginBottom: '20px',
    alignItems: 'flex-start'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  certBlock: {
    padding: '16px',
    background: 'var(--primary-glow)',
    borderRadius: '10px',
    border: '1px dashed var(--primary)'
  },
  certHelp: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    margin: 0
  },
  footerLink: {
    textAlign: 'center',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-glass)',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  }
};

export default MentorAuth;
