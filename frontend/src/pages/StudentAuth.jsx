import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StudentAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, register, error: authError } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'mentor') {
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
  const [studentType, setStudentType] = useState('beginner'); // beginner or skilled_user
  const [bio, setBio] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [skillsToTeach, setSkillsToTeach] = useState('');
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
        toast.success('Welcome back, Student!');
      } else {
        setLocalError(res.message || 'Login failed');
      }
    } else {
      if (!name || !email || !password) {
        setLocalError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const learnArr = skillsToLearn ? skillsToLearn.split(',').map(s => s.trim()).filter(s => s) : [];
      const teachArr = skillsToTeach ? skillsToTeach.split(',').map(s => s.trim()).filter(s => s) : [];

      const userData = {
        name,
        email,
        password,
        role: studentType,
        bio,
        skillsToLearn: learnArr,
        skillsToTeach: teachArr
      };

      const res = await register(userData);
      setLoading(false);
      if (res.success) {
        toast.success('Student Account created successfully!');
      } else {
        setLocalError(res.message || 'Registration failed');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel">
        <div style={styles.header}>
          <span style={styles.portalBadge} className="badge badge-primary">🎓 Student Portal</span>
          <h2 style={styles.title}>{isLogin ? 'Student Sign In' : 'Create Student Account'}</h2>
          <p style={styles.subtitle}>
            {isLogin ? 'Access your enrolled sessions and skill exchanges' : 'Start learning and swapping skills with peer mentors'}
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
            Register Student
          </button>
        </div>

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
                placeholder="Alex Morgan"
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
              placeholder="alex@example.com"
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
                <label className="form-label">Learning Goal Mode</label>
                <select 
                  className="form-control" 
                  value={studentType} 
                  onChange={(e) => setStudentType(e.target.value)}
                >
                  <option value="beginner">Beginner (Only looking to learn & book sessions)</option>
                  <option value="skilled_user">Skilled User (Want to learn AND offer P2P skill swap)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Share a bit about what skills you wish to learn..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills You Want to Learn (Comma-separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={skillsToLearn} 
                  onChange={(e) => setSkillsToLearn(e.target.value)} 
                  placeholder="Python, Public Speaking, Photography"
                />
              </div>

              {studentType === 'skilled_user' && (
                <div className="form-group">
                  <label className="form-label">Skills You Can Offer to Swap (Comma-separated)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={skillsToTeach} 
                    onChange={(e) => setSkillsToTeach(e.target.value)} 
                    placeholder="HTML, Graphic Design"
                  />
                </div>
              )}
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In as Student' : 'Create Student Account'}
          </button>
        </form>

        <div style={styles.footerLink}>
          <span>Are you an instructor? </span>
          <Link to="/mentor/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Go to Mentor Portal →
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
    maxWidth: '480px',
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
    background: 'var(--primary)',
    color: 'white',
    boxShadow: '0 4px 10px var(--primary-glow)'
  },
  errorAlert: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.85rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
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

export default StudentAuth;
