import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const AdminDashboard = () => {
  const { authFetch } = useAuth();
  const toast = useToast();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [records, setRecords] = useState({ bookings: [], reviews: [] });
  const [adminSessions, setAdminSessions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  // Category Form States
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catMessage, setCatMessage] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const res = await authFetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) setStats(data.data);
      } else if (activeTab === 'mentors') {
        const res = await authFetch('/api/admin/mentors/pending');
        const data = await res.json();
        if (data.success) setPendingMentors(data.data);
      } else if (activeTab === 'users') {
        const res = await authFetch('/api/admin/users');
        const data = await res.json();
        if (data.success) setUsers(data.data);
      } else if (activeTab === 'categories') {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } else if (activeTab === 'records') {
        const res = await authFetch('/api/admin/records');
        const data = await res.json();
        if (data.success) setRecords(data.data);
      } else if (activeTab === 'sessions') {
        const res = await authFetch('/api/admin/sessions');
        const data = await res.json();
        if (data.success) setAdminSessions(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMentor = async (mentorId, action) => {
    try {
      const res = await authFetch(`/api/admin/mentors/${mentorId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Mentor application ${action === 'approve' ? 'approved ✓' : 'rejected ✕'} successfully.`);
        fetchAdminData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCatMessage('');
    if (!newCatName || !newCatDesc) return;

    try {
      const res = await authFetch('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName, description: newCatDesc })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Category added successfully!');
        setNewCatName('');
        setNewCatDesc('');
        fetchAdminData();
      } else {
        toast.error(data.message || 'Failed to create category.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error adding category.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await authFetch(`/api/admin/categories/${catId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Category deleted.');
        fetchAdminData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await authFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User removed from platform.');
        fetchAdminData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'beginner' ? 'skilled_user' : 'beginner';
    if (!window.confirm(`Change user role to ${nextRole}?`)) return;

    try {
      const res = await authFetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: nextRole })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User role updated to ${nextRole}.`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={styles.header}>
        <h1 style={{ color: 'var(--text-primary)' }}>Admin Portal</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Platform operations control center: metrics, user management, and certificate verification</p>
      </div>

      {/* Tabs Menu */}
      <div style={styles.tabs} className="glass-panel">
        <button 
          style={{...styles.tabBtn, ...(activeTab === 'stats' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('stats')}
        >
          📈 Stats & Statistics
        </button>
        <button 
          style={{...styles.tabBtn, ...(activeTab === 'mentors' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('mentors')}
        >
          🎓 Mentor Verifications
        </button>
        <button 
          style={{...styles.tabBtn, ...(activeTab === 'users' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('users')}
        >
          👤 User Management
        </button>
        <button 
          style={{...styles.tabBtn, ...(activeTab === 'categories' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('categories')}
        >
          📁 Skill Categories
        </button>
        <button 
          style={{...styles.tabBtn, ...(activeTab === 'sessions' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('sessions')}
        >
          🗂 Sessions
        </button>
        <button 
          style={{...styles.tabBtn, ...(activeTab === 'records' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('records')}
        >
          🧾 Payments & Reviews
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0' }}>
          <Spinner text="Loading admin section..." />
        </div>
      ) : (
        <div style={styles.tabContent}>
          {/* STATS TAB */}
          {activeTab === 'stats' && stats && (
            <div className="grid-3">
              <div className="glass-panel" style={styles.metricCard}>
                <h3>Total Users</h3>
                <h1 style={styles.metricVal}>{stats.totalUsers}</h1>
                <p style={styles.metricLabel}>
                  {stats.totalBeginners} Beginners | {stats.totalSkilledUsers} Skilled | {stats.totalMentors} Mentors
                </p>
              </div>
              <div className="glass-panel" style={styles.metricCard}>
                <h3>Total Platform Bookings</h3>
                <h1 style={styles.metricVal}>{stats.totalBookings}</h1>
                <p style={styles.metricLabel}>Overall sessions scheduled</p>
              </div>
              <div className="glass-panel" style={styles.metricCard}>
                <h3>Accumulated Payouts</h3>
                <h1 style={styles.metricVal} className="gradient-text">${stats.totalEarnings}</h1>
                <p style={styles.metricLabel}>From mock checkout transactions</p>
              </div>
              <div className="glass-panel" style={styles.metricCard}>
                <h3>Skill Categories</h3>
                <h1 style={styles.metricVal}>{stats.totalCategories}</h1>
                <p style={styles.metricLabel}>Available directories</p>
              </div>
              <div className="glass-panel" style={styles.metricCard}>
                <h3>Pending Verifications</h3>
                <h1 style={{ ...styles.metricVal, color: '#fbbf24' }}>{stats.pendingMentorsCount}</h1>
                <p style={styles.metricLabel}>Mentors awaiting check</p>
              </div>
            </div>
          )}

          {/* MENTOR VERIFICATIONS TAB */}
          {activeTab === 'mentors' && (
            <div>
              <h2 style={styles.tabTitle}>Pending Mentor Applications</h2>
              {pendingMentors.length === 0 ? (
                <div className="glass-panel" style={styles.emptyState}>
                  <p>All mentor applications have been processed. No pending requests!</p>
                </div>
              ) : (
                <div className="custom-table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Email</th>
                        <th>Credentials / Certificates</th>
                        <th>Register Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingMentors.map((m) => (
                        <tr key={m._id}>
                          <td><strong>{m.name}</strong></td>
                          <td>{m.email}</td>
                          <td>
                            <div style={{ color: 'var(--primary)', fontWeight: '600' }}>
                              📜 {m.certificates?.join(', ') || 'No certificate uploaded'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                              Bio: {m.bio}
                            </div>
                          </td>
                          <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleVerifyMentor(m._id, 'approve')} 
                                className="btn btn-secondary" 
                                style={styles.tableBtn}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleVerifyMentor(m._id, 'reject')} 
                                className="btn btn-danger" 
                                style={styles.tableBtn}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div>
              <h2 style={styles.tabTitle}>Platform User Base</h2>
              <div className="custom-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Ratings</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${
                            u.role === 'admin' ? 'badge-danger' :
                            u.role === 'mentor' ? 'badge-primary' : 'badge-secondary'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{u.ratings > 0 ? `⭐️ ${u.ratings} (${u.reviewCount})` : 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {u.role !== 'admin' && u.role !== 'mentor' && (
                              <button 
                                onClick={() => handleChangeRole(u._id, u.role)} 
                                className="btn btn-outline" 
                                style={styles.tableBtn}
                              >
                                Toggle Role
                              </button>
                            )}
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => handleDeleteUser(u._id)} 
                                className="btn btn-danger" 
                                style={styles.tableBtn}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div style={styles.splitGrid} className="grid-2">
              {/* Categories list */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Categories List</h3>
                <div className="custom-table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c._id}>
                          <td>
                            <strong>{c.name}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              {c.description}
                            </div>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteCategory(c._id)} 
                              className="btn btn-danger" 
                              style={styles.tableBtn}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add category form */}
              <div className="glass-panel" style={{ padding: '30px', alignSelf: 'start' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Add Skill Category</h3>
                {catMessage && (
                  <div style={{ marginBottom: '16px', fontSize: '0.9rem' }}>{catMessage}</div>
                )}
                <form onSubmit={handleCreateCategory}>
                  <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Photography & Arts"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Detail what is included in this category folder..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Add Category
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* PAYMENTS & REVIEWS TAB */}
          {activeTab === 'records' && (
            <div>
              <h2 style={styles.tabTitle}>All Payment Transactions (Bookings)</h2>
              <div className="custom-table-wrapper" style={{ marginBottom: '40px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Booking Ref ID</th>
                      <th>Learner</th>
                      <th>Mentor</th>
                      <th>Price Paid</th>
                      <th>Trans. ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.bookings.map((b) => (
                      <tr key={b._id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{b._id}</td>
                        <td>{b.learner?.name}</td>
                        <td>{b.mentor?.name}</td>
                        <td>${b.amountPaid}</td>
                        <td>{b.paymentId || 'N/A'}</td>
                        <td>
                          <span className={`badge ${b.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 style={styles.tabTitle}>Learner Reviews</h2>
              <div className="custom-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Mentor (Reviewee)</th>
                      <th>Reviewer</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.reviews.map((r) => (
                      <tr key={r._id}>
                        <td><strong>{r.reviewee?.name}</strong></td>
                        <td>{r.reviewer?.name}</td>
                        <td style={{ color: '#fbbf24', fontWeight: 'bold' }}>⭐️ {r.rating} / 5</td>
                        <td>"{r.comment}"</td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '32px'
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    marginBottom: '40px',
    flexWrap: 'wrap',
    border: '1px solid var(--border-glass)'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '12px 20px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem'
  },
  activeTab: {
    background: 'var(--primary)',
    color: 'white',
    boxShadow: '0 4px 12px var(--primary-glow)'
  },
  tabContent: {
    marginTop: '20px'
  },
  tabTitle: {
    fontSize: '1.4rem',
    color: 'var(--text-primary)',
    marginBottom: '20px',
    fontFamily: 'Outfit, sans-serif'
  },
  metricCard: {
    padding: '30px'
  },
  metricVal: {
    fontSize: '3rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'Outfit, sans-serif',
    margin: '10px 0'
  },
  metricLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)'
  },
  tableBtn: {
    padding: '6px 12px',
    fontSize: '0.75rem'
  },
  splitGrid: {
    alignItems: 'start'
  }
};

export default AdminDashboard;
