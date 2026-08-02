import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import LiveChatModal from '../components/LiveChatModal';

const UserDashboard = () => {
  const { user, authFetch } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatRecipient, setChatRecipient] = useState(null);

  // Review Modal States
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  // Track which bookings have already been reviewed
  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch bookings where user is learner
      const bookingRes = await authFetch('/api/bookings?as=learner');
      const bookingData = await bookingRes.json();
      if (bookingData.success) {
        setBookings(bookingData.data);
      }

      // Fetch P2P exchange requests
      const exchangeRes = await authFetch('/api/exchanges');
      const exchangeData = await exchangeRes.json();
      if (exchangeData.success) {
        setExchanges(exchangeData.data);
      }

      // Fetch admin records to determine already-reviewed bookings
      // We check via a lightweight dedicated approach - fetch all reviews the user submitted
      const reviewRes = await authFetch('/api/bookings/my-reviews');
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        if (reviewData.success && reviewData.data) {
          const ids = new Set(reviewData.data.map(r => r.booking));
          setReviewedBookingIds(ids);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await authFetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Session marked as ${newStatus}!`);
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update booking status.');
    }
  };

  const handleExchangeStatus = async (exchangeId, newStatus) => {
    try {
      const res = await authFetch(`/api/exchanges/${exchangeId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Exchange proposal ${newStatus}!`);
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update exchange request.');
    }
  };

  const handleOpenReview = (booking) => {
    setReviewBooking(booking);
    setRating(5);
    setComment('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setReviewLoading(true);
    try {
      const res = await authFetch(`/api/bookings/${reviewBooking._id}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Thank you for your rating and review!');
        // Mark this booking as reviewed so button disappears
        setReviewedBookingIds(prev => new Set([...prev, reviewBooking._id]));
        setReviewBooking(null);
        fetchDashboardData();
      } else {
        toast.error(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error submitting review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <Spinner fullPage text="Loading your student dashboard..." />;
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={styles.header}>
        <h1 style={{ color: 'var(--text-primary)' }}>Learner Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your bookings, pay for sessions, leave reviews, and manage your skill exchanges</p>
      </div>

      {/* Booked Sessions Section */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={styles.sectionTitle}>My Booked Learning Sessions</h2>
        
        {bookings.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <p>You have not booked any learning sessions yet.</p>
            <Link to="/sessions" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Explore Classes & Mentors
            </Link>
          </div>
        ) : (
          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Session / Class</th>
                  <th>Mentor</th>
                  <th>Scheduled Slot</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{booking.session?.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Duration: {booking.session?.duration}</div>
                    </td>
                    <td>
                      <div>{booking.mentor?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {booking.mentor?.role?.replace('_', ' ')}
                      </div>
                    </td>
                    <td>{booking.scheduledTime}</td>
                    <td>
                      <span className={`badge ${booking.session?.type === 'exchange' ? 'badge-secondary' : 'badge-primary'}`}>
                        {booking.session?.type}
                      </span>
                    </td>
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
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {booking.mentor && (
                          <button 
                            onClick={() => setChatRecipient(booking.mentor)} 
                            className="btn btn-outline" 
                            style={{ ...styles.actionBtn, padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            💬 Chat
                          </button>
                        )}
                        {booking.paymentStatus === 'pending' && booking.session?.type === 'paid' && (
                          <Link to={`/checkout/${booking._id}`} className="btn btn-secondary" style={styles.actionBtn}>
                            Pay Now
                          </Link>
                        )}
                        {booking.status === 'approved' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking._id, 'completed')} 
                            className="btn btn-outline"
                            style={{ ...styles.actionBtn, borderColor: 'var(--success)', color: 'var(--success)' }}
                          >
                            Mark Completed
                          </button>
                        )}
                        {booking.status === 'completed' && !reviewedBookingIds.has(booking._id) && (
                          <button 
                            onClick={() => handleOpenReview(booking)} 
                            className="btn btn-primary"
                            style={styles.actionBtn}
                          >
                            Review Mentor
                          </button>
                        )}
                        {booking.status === 'completed' && reviewedBookingIds.has(booking._id) && (
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ Reviewed</span>
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

      {/* Peer-to-Peer Skill Exchanges Section */}
      {user.role === 'skilled_user' && (
        <section>
          <h2 style={styles.sectionTitle}>My P2P Skill Exchanges</h2>
          {exchanges.length === 0 ? (
            <div className="glass-panel" style={styles.emptyState}>
              <p>No active skill exchange proposals found.</p>
            </div>
          ) : (
            <div className="custom-table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Requested Skill</th>
                    <th>Offered Skill</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exchanges.map((ex) => {
                    const isSender = ex.sender?._id === user._id;
                    return (
                      <tr key={ex._id}>
                        <td>
                          {isSender ? <strong>Me</strong> : ex.sender?.name}
                        </td>
                        <td>
                          {isSender ? ex.receiver?.name : <strong>Me</strong>}
                        </td>
                        <td>
                          <span className="badge badge-primary">{ex.requestedSkill}</span>
                        </td>
                        <td>
                          <span className="badge badge-secondary">{ex.offeredSkill}</span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#9ca3af', maxWidth: '250px' }}>
                          "{ex.message}"
                        </td>
                        <td>
                          <span className={`badge ${
                            ex.status === 'approved' ? 'badge-success' :
                            ex.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {ex.status}
                          </span>
                        </td>
                        <td>
                          {!isSender && ex.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleExchangeStatus(ex._id, 'approved')} 
                                className="btn btn-secondary"
                                style={styles.actionBtn}
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleExchangeStatus(ex._id, 'rejected')} 
                                className="btn btn-danger"
                                style={styles.actionBtn}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>Review your session with {reviewBooking.mentor?.name}</h2>
              <button style={styles.closeBtn} onClick={() => setReviewBooking(null)}>✕</button>
            </div>
            
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Rating (1 to 5 Stars)</label>
                <select 
                  className="form-control"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value="5">⭐️⭐️⭐️⭐️⭐️ (Excellent)</option>
                  <option value="4">⭐️⭐️⭐️⭐️ (Good)</option>
                  <option value="3">⭐️⭐️⭐️ (Average)</option>
                  <option value="2">⭐️⭐️ (Poor)</option>
                  <option value="1">⭐️ (Terrible)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Review Comment</label>
                <textarea 
                  className="form-control"
                  rows="4"
                  placeholder="Tell others what you learned, what you liked about their teaching style, etc..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setReviewBooking(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={reviewLoading}
                >
                  {reviewLoading ? 'Submitting...' : 'Post Review'}
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
  header: {
    marginBottom: '32px'
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
    maxWidth: '500px',
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

export default UserDashboard;
