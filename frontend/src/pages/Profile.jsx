import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('beginner');
  const [skillsToTeach, setSkillsToTeach] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setRole(user.role || 'beginner');
      setSkillsToTeach(user.skillsToTeach?.join(', ') || '');
      setSkillsToLearn(user.skillsToLearn?.join(', ') || '');
      setCertificateUrl(user.certificates?.[0] || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const teachArr = skillsToTeach ? skillsToTeach.split(',').map(s => s.trim()).filter(s => s) : [];
    const learnArr = skillsToLearn ? skillsToLearn.split(',').map(s => s.trim()).filter(s => s) : [];
    const certsArr = certificateUrl ? [certificateUrl.trim()] : [];

    const updatedData = {
      name,
      bio,
      role,
      skillsToTeach: teachArr,
      skillsToLearn: learnArr,
      certificates: certsArr
    };

    const res = await updateProfile(updatedData);
    setLoading(false);
    
    if (res.success) {
      setMessage('✅ Profile updated successfully!');
    } else {
      setMessage(`❌ Failed: ${res.message}`);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center', color: '#9ca3af' }}>
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={styles.gridContainer} className="grid-2">
        {/* Left Side: Summary Card */}
        <div className="glass-panel" style={styles.summaryCard}>
          <div style={styles.avatar}>👤</div>
          <h2 style={{ color: 'var(--text-primary)', marginTop: '16px' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {user.role.replace('_', ' ')}
          </p>

          {user.role === 'mentor' && (
            <div style={{ marginTop: '12px' }}>
              <span className={`badge ${
                user.mentorStatus === 'approved' ? 'badge-success' :
                user.mentorStatus === 'pending' ? 'badge-warning' : 'badge-danger'
              }`}>
                Verification: {user.mentorStatus}
              </span>
            </div>
          )}

          {user.ratings > 0 && (
            <div style={styles.ratingInfo}>
              <span>⭐️ {user.ratings} Average Rating</span>
              <span style={{ color: '#6b7280' }}>({user.reviewCount} reviews)</span>
            </div>
          )}

          <div style={styles.skillsSummary}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Skills I Teach</h4>
            {user.skillsToTeach?.length > 0 ? (
              <div style={styles.tagWrapper}>
                {user.skillsToTeach.map((s, i) => (
                  <span key={i} className="badge badge-secondary">{s}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No teaching skills listed</p>
            )}

            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>Skills I Want to Learn</h4>
            {user.skillsToLearn?.length > 0 ? (
              <div style={styles.tagWrapper}>
                {user.skillsToLearn.map((s, i) => (
                  <span key={i} className="badge badge-primary">{s}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No learning skills listed</p>
            )}
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '24px' }}>Edit Profile Settings</h3>
          
          {message && (
            <div style={{ marginBottom: '20px', fontSize: '0.95rem' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select 
                className="form-control" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="beginner">Beginner (Learner)</option>
                <option value="skilled_user">Skilled User (Teach & Exchange)</option>
                <option value="mentor">Professional Mentor (Paid Classes)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Biography</label>
              <textarea 
                className="form-control" 
                rows="3"
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Share your experience and background..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skills You Can Teach (Comma-separated)</label>
              <input 
                type="text" 
                className="form-control" 
                value={skillsToTeach} 
                onChange={(e) => setSkillsToTeach(e.target.value)} 
                placeholder="e.g. Node.js, Graphic Design, Calculus"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skills You Want to Learn (Comma-separated)</label>
              <input 
                type="text" 
                className="form-control" 
                value={skillsToLearn} 
                onChange={(e) => setSkillsToLearn(e.target.value)} 
                placeholder="e.g. Spanish, Negotiation, Python"
              />
            </div>

            {role === 'mentor' && (
              <div className="form-group" style={styles.certBlock}>
                <label className="form-label" style={{ color: 'var(--primary)' }}>
                  Professional Certificate Verification
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={certificateUrl} 
                  onChange={(e) => setCertificateUrl(e.target.value)} 
                  placeholder="e.g. Certificate Name, Google Cloud Architect Link"
                />
                <p style={styles.certNotice}>
                  Updating this certificate triggers admin review. If your role changes to Mentor, you will need approval before posting paid sessions. Current verification: <strong>{user.mentorStatus}</strong>.
                </p>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '16px' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Update Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  gridContainer: {
    alignItems: 'start'
  },
  summaryCard: {
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    fontSize: '4.5rem',
    background: 'var(--bg-secondary)',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--border-glass)'
  },
  ratingInfo: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '0.9rem',
    marginTop: '16px',
    color: '#fbbf24'
  },
  skillsSummary: {
    width: '100%',
    textAlign: 'left',
    marginTop: '30px',
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '24px'
  },
  tagWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  certBlock: {
    padding: '16px',
    background: 'var(--primary-glow)',
    borderRadius: '10px',
    border: '1px dashed var(--primary)'
  },
  certNotice: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '8px',
    lineHeight: '1.4'
  }
};

export default Profile;
