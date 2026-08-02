import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import LiveChatModal from '../components/LiveChatModal';

const MentorDashboard = () => {
  const { user, authFetch } = useAuth();
  const toast = useToast();
  
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chatRecipient, setChatRecipient] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // New Session Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(25);
  const [duration, setDuration] = useState('1 Hour');
  const [slots, setSlots] = useState('Monday 10:00 AM, Wednesday 3:00 PM');
  const [type, setType] = useState('paid');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await fetch('/api/admin/categories');
      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.data);
        if (catData.data.length > 0) setCategory(catData.data[0]._id);
      }

      // 2. Fetch my hosted bookings, sessions, and reviews
      const [sessRes, bookRes, reviewRes] = await Promise.all([
        authFetch('/api/sessions'),
        authFetch('/api/bookings?as=mentor'),
        authFetch('/api/bookings/mentor-reviews'),
      ]);

      const safeJson = async (r) => {
        try {
          if (!r || !r.ok) return { success: false };
          const txt = await r.text();
          return txt ? JSON.parse(txt) : { success: false };
        } catch { return { success: false }; }
      };

      const [sessData, bookData, reviewData] = await Promise.all([
        safeJson(sessRes),
        safeJson(bookRes),
        safeJson(reviewRes),
      ]);

      if (sessData.success) {
        const mySessions = sessData.data.filter(s => s.creator?._id === user._id || s.creator === user._id);
        setSessions(mySessions);
      }
      if (bookData.success) {
        const myBookings = bookData.data.filter(b => b.mentor?._id === user._id || b.mentor === user._id);
        setBookings(myBookings);
      }
      if (reviewData.success) {
        setReceivedReviews(reviewData.data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !category || !duration || !slots) {
      setFormError('Please fill in all fields');
      return;
    }

    setFormLoading(true);
    const slotsArr = slots.split(',').map(s => s.trim()).filter(s => s);

    try {
      const res = await authFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          price: type === 'exchange' ? 0 : Number(price),
          duration,
          slots: slotsArr,
          type
        })
      });
      const data = await res.json();

      if (data.success) {
        setModalOpen(false);
        setTitle('');
        setDescription('');
        setPrice(25);
        setSlots('Monday 10:00 AM, Wednesday 3:00 PM');
        fetchDashboardData();
        toast.success('Session created successfully!');
      } else {
        setFormError(data.message || 'Failed to create session');
      }
    } catch (err) {
      setFormError('Server error creating session.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, actionStatus) => {
    try {
      const res = await authFetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: actionStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Booking ${actionStatus}!`);
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update booking.');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session? This cannot be undone.')) return;
    try {
      const res = await authFetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Session and its bookings have been removed.');
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete session.');
    }
  };

  // Calculate earnings (sum of price of bookings that are paid)
  const totalEarnings = bookings
    .filter(b => b.paymentStatus === 'paid' && (b.status === 'approved' || b.status === 'completed'))
    .reduce((acc, current) => acc + (current.amountPaid || 0), 0);

  if (loading) {
    return <Spinner fullPage text="Loading mentor dashboard..." />;
  }

  // Double check if role is correct or if they are blocked by verification
  if (user.role !== 'mentor' && user.role !== 'admin' && user.role !== 'skilled_user') {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <h3>Access Restricted</h3>
          <p style={{ color: '#9ca3af', marginTop: '10px' }}>
            Only verified Professional Mentors or Skilled Users can host sessions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {user.role === 'mentor' && user.mentorStatus !== 'approved' ? (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <h3 style={{ color: '#fbbf24' }}>⚠️ Registration Pending Approval</h3>
          <p style={{ color: '#9ca3af', marginTop: '10px' }}>
            Your certificates are currently undergoing verification by our administration team. You will be able to create paid classes once approved. Current status: <strong>{user.mentorStatus}</strong>.
          </p>
        </div>
      ) : null}

      <div style={styles.topHeader}>
        <div>
          <h1 style={{ color: 'var(--text-primary)' }}>Mentor Console</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your schedules, review learner bookings, and track your platform payout status</p>
        </div>
        {(user.role === 'skilled_user' || (user.role === 'mentor' && user.mentorStatus === 'approved')) && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            + Create New Session
          </button>
        )}
      </div>

      {/* Stats Counter */}
      <div className="grid-3" style={{ marginBottom: '40px' }}>
        <div className="glass-panel" style={styles.statBox}>
          <div style={styles.statTitle}>Simulated Earnings</div>
          <div style={styles.statValue}>${totalEarnings}</div>
          <div style={styles.statLabel}>From paid bookings</div>
        </div>
        <div className="glass-panel" style={styles.statBox}>
          <div style={styles.statTitle}>Total Sessions Hosted</div>
          <div style={styles.statValue}>{sessions.length}</div>
          <div style={styles.statLabel}>Active listings</div>
        </div>
        <div className="glass-panel" style={styles.statBox}>
          <div style={styles.statTitle}>Learners Booked</div>
          <div style={styles.statValue}>{bookings.length}</div>
          <div style={styles.statLabel}>Reservations total</div>
        </div>
        <div className="glass-panel" style={styles.statBox}>
          <div style={styles.statTitle}>Rating</div>
          <div style={styles.statValue}>
            {receivedReviews.length > 0
              ? (receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length).toFixed(1)
              : '–'}
          </div>
          <div style={styles.statLabel}>Avg from {receivedReviews.length} review{receivedReviews.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Bookings Section */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={styles.sectionTitle}>Learner Bookings & Requests</h2>
        {bookings.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <p>No learners have booked your sessions yet.</p>
          </div>
        ) : (
          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Session Title</th>
                  <th>Scheduled Time</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{booking.learner?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{booking.learner?.email}</div>
                    </td>
                    <td>{booking.session?.title}</td>
                    <td>{booking.scheduledTime}</td>
                    <td>${booking.amountPaid}</td>
                    <td>
                      <span className={`badge ${booking.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        booking.status === 'completed' ? 'badge-success' :
                        booking.status === 'approved' ? 'badge-primary' :
                        booking.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {booking.learner && (
                          <button 
                            onClick={() => setChatRecipient(booking.learner)} 
                            className="btn btn-outline" 
                            style={{ ...styles.actionBtn, padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            💬 Chat
                          </button>
                        )}
                        {booking.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleBookingAction(booking._id, 'approved')} 
                              className="btn btn-secondary" 
                              style={styles.actionBtn}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleBookingAction(booking._id, 'rejected')} 
                              className="btn btn-danger" 
                              style={styles.actionBtn}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <button 
                            onClick={() => handleBookingAction(booking._id, 'completed')} 
                            className="btn btn-outline" 
                            style={{ ...styles.actionBtn, color: 'var(--success)', borderColor: 'var(--success)' }}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Sessions Catalog Section */}
      <section>
        <h2 style={styles.sectionTitle}>My Session Catalog</h2>
        {sessions.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <p>You have not created any session listings yet.</p>
          </div>
        ) : (
          <div className="grid-3">
            {sessions.map((sess) => (
              <div key={sess._id} className="glass-panel" style={styles.sessCard}>
                <div style={styles.sessCardHeader}>
                  <span className={`badge ${sess.type === 'exchange' ? 'badge-secondary' : 'badge-primary'}`}>
                    {sess.type}
                  </span>
                  <span style={styles.sessCardPrice}>
                    {sess.type === 'exchange' ? 'Exchange' : `$${sess.price}`}
                  </span>
                </div>
                
                <h3 style={{ color: 'var(--text-primary)', marginTop: '10px' }}>{sess.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: '1', margin: '8px 0 16px 0' }}>
                  {sess.description}
                </p>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', fontSize: '0.85rem' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Duration: <strong style={{ color: 'var(--text-primary)' }}>{sess.duration}</strong></div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Slots: <strong style={{ color: 'var(--text-primary)' }}>{sess.slots?.join(', ')}</strong></div>
                </div>

                <button
                  onClick={() => handleDeleteSession(sess._id)}
                  className="btn btn-danger"
                  style={{ marginTop: '16px', width: '100%', fontSize: '0.8rem', padding: '8px' }}
                >
                  🗑 Remove Session
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews Received Section */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={styles.sectionTitle}>Reviews Received ({receivedReviews.length})</h2>
        {receivedReviews.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <p>No reviews received yet. Complete sessions to receive learner reviews.</p>
          </div>
        ) : (
          <div className="grid-3">
            {receivedReviews.map((rev) => (
              <div key={rev._id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {rev.reviewer?.name || 'Anonymous'}
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(star => (
                      <span key={star} style={{ color: star <= rev.rating ? '#f59e0b' : '#d1d5db', fontSize: '1rem' }}>★</span>
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0, fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                  {new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Session Modal */}
      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>Create Learning Session</h2>
              <button style={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
            </div>

            {formError && (
              <div style={{ marginBottom: '16px', color: '#ef4444', fontSize: '0.9rem' }}>
                ❌ {formError}
              </div>
            )}

            <form onSubmit={handleCreateSession}>
              <div className="form-group">
                <label className="form-label">Session Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Master Figma Components & Autolayout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="What will students learn in this session? Please detail topics."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select 
                    className="form-control"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="paid">Paid Class</option>
                    {user.role === 'skilled_user' && (
                      <option value="exchange">Skill Swap (Free)</option>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {type === 'paid' && (
                  <div className="form-group">
                    <label className="form-label">Price (USD)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 1 hour, 45 minutes"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Available Slots (Comma-separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Mon 10:00 AM, Fri 3:00 PM"
                  value={slots}
                  onChange={(e) => setSlots(e.target.value)}
                  required
                />
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : 'Publish Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Chat Modal */}
      {chatRecipient && (
        <LiveChatModal 
          recipient={chatRecipient} 
          onClose={() => setChatRecipient(null)} 
        />
      )}
    </div>
  );
};

const styles = {
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  statBox: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column'
  },
  statTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'Outfit, sans-serif',
    margin: '6px 0'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  sectionTitle: {
    fontSize: '1.4rem',
    color: 'var(--text-primary)',
    marginBottom: '20px',
    fontFamily: 'Outfit, sans-serif'
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)'
  },
  actionBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem'
  },
  sessCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column'
  },
  sessCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sessCardPrice: {
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    width: '100%',
    maxWidth: '550px',
    padding: '30px',
    border: '1px solid var(--border-glass)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  }
};

export default MentorDashboard;
