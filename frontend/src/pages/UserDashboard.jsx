import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/Spinner';

const UserDashboard = () => {
  const { user, authFetch } = useAuth();
  const { socket, openChat } = useSocket();
  const toast = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review & Feedback Modal States
  const [reviewTarget, setReviewTarget] = useState(null); // { type: 'booking' | 'exchange', item, partnerName }
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewedItemIds, setReviewedItemIds] = useState(new Set());

  useEffect(() => {
    if (user) {
      if (user.role === 'mentor') {
        navigate('/mentor');
        return;
      }
      if (user.role === 'admin') {
        navigate('/admin');
        return;
      }
    }
    fetchDashboardData();
  }, [user, navigate]);

  // Listen for real-time Skill Swap notifications
  useEffect(() => {
    if (socket) {
      const handleNewExchange = (data) => {
        if (toast && toast.info) toast.info(data.message || 'New Skill Swap request received!');
        fetchDashboardData();
      };

      const handleExchangeUpdated = (data) => {
        if (toast && toast.info) toast.info(data.message || 'Skill Swap status updated!');
        fetchDashboardData();
      };

      socket.on('new_exchange_request', handleNewExchange);
      socket.on('exchange_status_updated', handleExchangeUpdated);

      return () => {
        socket.off('new_exchange_request', handleNewExchange);
        socket.off('exchange_status_updated', handleExchangeUpdated);
      };
    }
  }, [socket, toast]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const safeParse = async (res) => {
      try {
        if (!res || !res.ok) return { success: false };
        const txt = await res.text();
        return txt ? JSON.parse(txt) : { success: false };
      } catch { return { success: false }; }
    };

    try {
      const bookingsRes = await authFetch('/api/bookings?as=learner');
      const bookingsData = await safeParse(bookingsRes);
      if (bookingsData.success) {
        setBookings(bookingsData.data);
      }

      const exchangesRes = await authFetch('/api/exchanges');
      const exchangesData = await safeParse(exchangesRes);
      if (exchangesData.success) {
        setExchanges(exchangesData.data);
      }

      const reviewRes = await authFetch('/api/bookings/my-reviews');
      const reviewData = await safeParse(reviewRes);
      if (reviewData.success && reviewData.data) {
        const ids = new Set(reviewData.data.map(r => r.booking || r.exchange));
        setReviewedItemIds(ids);
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
        toast.success(`Skill exchange marked as ${newStatus}!`);
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update exchange request.');
    }
  };

  const handleOpenReview = (targetType, item, partnerName) => {
    setReviewTarget({ type: targetType, item, partnerName });
    setRating(5);
    setComment('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;

    setReviewLoading(true);
    try {
      const endpoint = reviewTarget.type === 'booking'
        ? `/api/bookings/${reviewTarget.item._id}/review`
        : `/api/exchanges/${reviewTarget.item._id}/review`;

      const res = await authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Thank you! Your rating and feedback review was submitted.');
        setReviewedItemIds(prev => new Set([...prev, reviewTarget.item._id]));
        setReviewTarget(null);
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

  const enrolledCount = bookings.length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const pendingPaymentCount = bookings.filter(b => b.paymentStatus === 'pending' && b.session?.type === 'paid').length;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={styles.header}>
        <h1 style={{ color: 'var(--text-primary)' }}>Learner Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your enrolled sessions, session payments, and mentor ratings</p>
      </div>

      {/* Student Stats Summary */}
      <div className="grid-3" style={{ marginBottom: '40px' }}>
        <div className="glass-panel" style={styles.statBox}>
          <div style={styles.statTitle}>Enrolled Sessions</div>
          <div style={styles.statValue}>{enrolledCount}</div>
          <div style={styles.statLabel}>Total classes booked</div>
        </div>
        <div className="glass-panel" style={styles.statBox}>
          <div style={styles.statTitle}>Completed Sessions</div>
          <div style={{ ...styles.statValue, color: 'var(--success)' }}>{completedCount}</div>
          <div style={styles.statLabel}>Finished learning classes</div>
        </div>
        <div className="glass-panel" style={styles.statBox}>
          <div style={styles.statTitle}>Pending Payments</div>
          <div style={{ ...styles.statValue, color: pendingPaymentCount > 0 ? '#fbbf24' : 'var(--text-primary)' }}>{pendingPaymentCount}</div>
          <div style={styles.statLabel}>Awaiting checkout completion</div>
        </div>
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
                            onClick={() => openChat(booking.mentor)} 
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
                        {booking.status === 'completed' && !reviewedItemIds.has(booking._id) && (
                          <button 
                            onClick={() => handleOpenReview('booking', booking, booking.mentor?.name)} 
                            className="btn btn-primary"
                            style={styles.actionBtn}
                          >
                            Review Mentor
                          </button>
                        )}
                        {booking.status === 'completed' && reviewedItemIds.has(booking._id) && (
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

      {/* Peer-to-Peer Skill Exchanges Section (Only for skilled users or if user has active exchange requests) */}
      {(user?.role === 'skilled_user' || exchanges.length > 0) && (
        <section style={{ marginTop: '40px' }}>
          <h2 style={styles.sectionTitle}>My P2P Skill Exchanges</h2>
          {exchanges.length === 0 ? (
            <div className="glass-panel" style={styles.emptyState}>
              <p>No active skill exchange proposals found.</p>
              <Link to="/sessions" className="btn btn-outline" style={{ marginTop: '12px', fontSize: '0.85rem' }}>
                Explore Peer Sessions to Swap Skills
              </Link>
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
                    const isSender = ex.sender?._id === user._id || ex.sender === user._id;
                    const otherParty = isSender ? ex.receiver : ex.sender;
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
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {otherParty && (
                              <button 
                                onClick={() => openChat(otherParty)} 
                                className="btn btn-outline" 
                                style={{ ...styles.actionBtn, padding: '4px 10px', fontSize: '0.8rem' }}
                              >
                                💬 Chat
                              </button>
                            )}
                            {!isSender && ex.status === 'pending' && (
                              <>
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
                              </>
                            )}
                            {ex.status === 'approved' && (
                              <button 
                                onClick={() => handleExchangeStatus(ex._id, 'completed')} 
                                className="btn btn-outline"
                                style={{ ...styles.actionBtn, borderColor: 'var(--success)', color: 'var(--success)' }}
                              >
                                Mark Completed
                              </button>
                            )}
                            {ex.status === 'completed' && !reviewedItemIds.has(ex._id) && (
                              <button 
                                onClick={() => handleOpenReview('exchange', ex, otherParty?.name || 'Partner')} 
                                className="btn btn-primary"
                                style={styles.actionBtn}
                              >
                                Review Partner
                              </button>
                            )}
                            {ex.status === 'completed' && reviewedItemIds.has(ex._id) && (
                              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ Reviewed</span>
                            )}
                          </div>
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

      {/* Enhanced Review & Feedback Modal */}
      {reviewTarget && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.2rem' }}>
                ⭐ Review & Feedback for {reviewTarget.partnerName}
              </h2>
              <button style={styles.closeBtn} onClick={() => setReviewTarget(null)}>✕</button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              {reviewTarget.type === 'booking' 
                ? `Mentorship Class: ${reviewTarget.item.session?.title || 'Learning Session'}` 
                : `P2P Skill Swap: ${reviewTarget.item.offeredSkill} ⇄ ${reviewTarget.item.requestedSkill}`
              }
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Star Rating</label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '1.8rem', cursor: 'pointer', marginBottom: '10px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star}
                      onClick={() => setRating(star)}
                      style={{
                        color: star <= rating ? '#fbbf24' : '#4b5563',
                        transition: 'transform 0.15s ease',
                        transform: star <= rating ? 'scale(1.15)' : 'scale(1)'
                      }}
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ (Excellent Experience)'}
                  {rating === 4 && '⭐️⭐️⭐️⭐️ (Great & Helpful)'}
                  {rating === 3 && '⭐️⭐️⭐️ (Good / Average)'}
                  {rating === 2 && '⭐️⭐️ (Needs Improvement)'}
                  {rating === 1 && '⭐️ (Unsatisfactory)'}
                </span>
              </div>

              {/* Quick Feedback Preset Tags */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Quick Preset Feedback</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    "Clear & helpful explanations! 💡",
                    "Punctual, friendly & supportive! 🙌",
                    "Great practical skill swap experience! ✨",
                    "Highly recommended mentor! 🏆"
                  ].map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setComment(prev => prev ? `${prev} ${preset}` : preset)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '4px 8px', borderColor: 'var(--border-glass)' }}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Detailed Written Review / Feedback *</label>
                <textarea 
                  className="form-control"
                  rows="4"
                  placeholder="Share your experience, feedback, what you learned, and suggestions..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setReviewTarget(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={reviewLoading}
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const styles = {
  header: {
    marginBottom: '32px'
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
