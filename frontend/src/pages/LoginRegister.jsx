import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, error: authError } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('beginner');
  const [bio, setBio] = useState('');
  const [skillsToTeach, setSkillsToTeach] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setLocalError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        navigate('/');
      }
    } else {
      if (!name || !email || !password || !role) {
        setLocalError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Parse comma-separated skills
      const teachArr = skillsToTeach ? skillsToTeach.split(',').map(s => s.trim()).filter(s => s) : [];
      const learnArr = skillsToLearn ? skillsToLearn.split(',').map(s => s.trim()).filter(s => s) : [];
      const certsArr = certificateUrl ? [certificateUrl.trim()] : [];

      const userData = {
        name,
        email,
        password,
        role,
        bio,
        skillsToTeach: teachArr,
        skillsToLearn: learnArr,
        certificates: certsArr
      };

      const res = await register(userData);
      setLoading(false);
      if (res.success) {
        navigate('/');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel">
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
            Create Account
          </button>
        </div>

        <h2 style={styles.title}>
          {isLogin ? 'Welcome Back' : 'Join SkillExchange'}
        </h2>
        <p style={styles.subtitle}>
          {isLogin ? 'Access your dashboard and active classes' : 'Start learning, teaching, or exchanging skills today'}
        </p>

        {(localError || authError) && (
          <div style={styles.errorAlert} className="badge-danger">
            ⚠️ {localError || authError}
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
                placeholder="John Doe"
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
              placeholder="john@example.com"
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
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Primary Account Role *</label>
                <select 
                  className="form-control" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="beginner">Beginner (Looking to learn)</option>
                  <option value="skilled_user">Skilled User (Want to teach & exchange)</option>
                  <option value="mentor">Professional Mentor (Paid training sessions)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              {role === 'skilled_user' && (
                <div className="form-group">
                  <label className="form-label">Skills You Can Teach (Comma-separated)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={skillsToTeach} 
                    onChange={(e) => setSkillsToTeach(e.target.value)} 
                    placeholder="HTML, CSS, Photography"
                  />
                </div>
              )}

              {role !== 'mentor' && (
                <div className="form-group">
                  <label className="form-label">Skills You Want to Learn (Comma-separated)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={skillsToLearn} 
                    onChange={(e) => setSkillsToLearn(e.target.value)} 
                    placeholder="React, Public Speaking"
                  />
                </div>
              )}

              {role === 'mentor' && (
                <div className="form-group" style={styles.highlightGroup}>
                  <label className="form-label" style={{ color: 'var(--primary)' }}>
                    Mentor Certification Verification *
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={certificateUrl} 
                    onChange={(e) => setCertificateUrl(e.target.value)} 
                    placeholder="Add Certificate Name, ID, or Link (e.g., Oracle Certified Java Expert)"
                  />
                  <p style={styles.helpText}>
                    Note: Certifications must be approved by the admin before you can post paid sessions.
                  </p>
                </div>
              )}
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
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
    padding: '40px 24px',
    background: 'radial-gradient(circle at center, var(--primary-glow) 0%, rgba(252, 250, 246, 0) 100%)'
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    padding: '40px',
    border: '1px solid var(--border-glass)'
  },
  toggleWrapper: {
    display: 'flex',
    background: 'var(--bg-secondary)',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '30px',
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
    background: 'var(--primary)',
    color: 'white',
    boxShadow: '0 4px 10px var(--primary-glow)'
  },
  title: {
    fontSize: '1.8rem',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginBottom: '24px'
  },
  errorAlert: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  highlightGroup: {
    padding: '16px',
    background: 'var(--primary-glow)',
    borderRadius: '10px',
    border: '1px dashed var(--primary)'
  },
  helpText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    lineHeight: '1.4'
  }
};

export default LoginRegister;
