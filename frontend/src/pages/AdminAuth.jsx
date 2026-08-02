import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminAuth = () => {
  const { user, login, error: authError } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    if (!email || !password) {
      setLocalError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      if (res.role === 'admin') {
        toast.success('Welcome to Admin Control Center');
        navigate('/admin');
      } else {
        setLocalError('Account is not authorized as Administrator.');
      }
    } else {
      setLocalError(res.message || 'Admin login failed');
    }
  };

  const handleQuickAdminLogin = async () => {
    setLocalError('');
    setLoading(true);
    setEmail('admin@skillexchange.com');
    setPassword('adminpassword123');

    const res = await login('admin@skillexchange.com', 'adminpassword123');
    setLoading(false);
    if (res.success) {
      toast.success('System Admin Quick Sign-In Successful!');
      navigate('/admin');
    } else {
      setLocalError(res.message || 'Admin login failed. Please ensure backend is running.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel">
        <div style={styles.header}>
          <span style={styles.portalBadge} className="badge badge-danger">🛡️ Admin Control Center</span>
          <h2 style={styles.title}>Admin Sign In</h2>
          <p style={styles.subtitle}>
            Platform oversight, mentor certificate verification, and user management
          </p>
        </div>

        {(localError || authError) && (
          <div style={styles.errorAlert} className="badge-danger">
            ⚠️ {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Admin Email *</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@skillexchange.com"
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

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px', background: 'var(--danger)', borderColor: 'var(--danger)' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
          </button>
        </form>

        <div style={styles.quickAccessSection}>
          <div style={styles.divider}>
            <span>DEVELOPER QUICK SIGN-IN</span>
          </div>
          <button 
            onClick={handleQuickAdminLogin} 
            className="btn btn-outline" 
            style={{ width: '100%', fontSize: '0.88rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
            disabled={loading}
          >
            ⚡ Quick Sign In as System Admin
          </button>
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
    maxWidth: '440px',
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
  quickAccessSection: {
    marginTop: '28px',
    paddingTop: '16px'
  },
  divider: {
    textAlign: 'center',
    borderBottom: '1px solid var(--border-glass)',
    lineHeight: '0.1em',
    marginBottom: '20px',
    color: 'var(--text-secondary)',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.05em'
  }
};

export default AdminAuth;
