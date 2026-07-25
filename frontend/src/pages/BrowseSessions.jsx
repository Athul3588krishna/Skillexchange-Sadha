import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BrowseSessions = () => {
  const { user, token, authFetch } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type, setType] = useState('');

  // Booking Modal States
  const [bookingSession, setBookingSession] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customSlot, setCustomSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  // Skill Exchange Request States (P2P Swap)
  const [exchangeTargetUser, setExchangeTargetUser] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [exchangeMsg, setExchangeMsg] = useState('');
  const [exchangeLoading, setExchangeLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [category, type, search]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      let url = `/api/sessions?search=${search}`;
      if (category) url += `&category=${category}`;
      if (type) url += `&type=${type}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (session) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingSession(session);
    setSelectedSlot(session.slots[0] || '');
    setBookingMessage('');
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!bookingSession) return;

    const time = selectedSlot === 'custom' || !selectedSlot ? customSlot : selectedSlot;
    if (!time) {
      setBookingMessage('❌ Please specify a date and time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await authFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: bookingSession._id,
          scheduledTime: time
        })
      });
      const data = await res.json();

      if (data.success) {
        setBookingSession(null);
        if (bookingSession.type === 'paid') {
          // Redirect to checkout simulation
          navigate(`/checkout/${data.data._id}`);
        } else {
          // Exchange is free
          alert('Skill Exchange Booked! The host has been notified.');
          navigate('/dashboard');
        }
      } else {
        setBookingMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setBookingMessage('❌ Booking request failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleOpenExchange = (hostUser) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setExchangeTargetUser(hostUser);
    setOfferedSkill(user.skillsToTeach?.join(', ') || '');
    setRequestedSkill(hostUser.skillsToTeach?.[0] || '');
    setExchangeMsg(`Hi ${hostUser.name}, I would love to swap skills with you!`);
  };

  const handleSendExchange = async (e) => {
    e.preventDefault();
    if (!exchangeTargetUser) return;

    setExchangeLoading(true);
    try {
      const res = await authFetch('/api/exchanges', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: exchangeTargetUser._id,
          offeredSkill,
          requestedSkill,
          message: exchangeMsg
        })
      });
      const data = await res.json();

      if (data.success) {
        alert(`Skill Exchange proposal sent to ${exchangeTargetUser.name}!`);
        setExchangeTargetUser(null);
        navigate('/dashboard');
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error sending request.');
    } finally {
      setExchangeLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={styles.header}>
        <h1 style={{ color: 'var(--text-primary)' }}>Browse Learning Sessions</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Book paid mentor courses or request a peer-to-peer skill swap</p>
      </div>

      {/* Filter Toolbar */}
      <div style={styles.toolbar} className="glass-panel">
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Search Keywords</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search e.g. Python, React..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category</label>
          <select 
            className="form-control" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Session Type</label>
          <select 
            className="form-control" 
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="paid">Paid Mentorship</option>
            <option value="exchange">Skill Exchange (Free)</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading active classes...
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          <h3>No sessions match your search.</h3>
          <p style={{ marginTop: '10px' }}>Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid-3">
          {sessions.map((sess) => (
            <div key={sess._id} className="glass-panel-interactive" style={styles.card}>
              <div style={styles.cardHeader}>
                <span className={`badge ${sess.type === 'exchange' ? 'badge-secondary' : 'badge-primary'}`}>
                  {sess.type}
                </span>
                <span style={styles.price}>
                  {sess.type === 'exchange' ? 'Free Swap' : `$${sess.price}`}
                </span>
              </div>

              <div style={styles.categoryBadge}>
                📁 {sess.category?.name}
              </div>

              <h3 style={styles.title}>{sess.title}</h3>
              <p style={styles.desc}>{sess.description}</p>

              <div style={styles.creatorInfo}>
                <div>
                  <div style={styles.creatorName}>👤 {sess.creator?.name}</div>
                  <div style={styles.creatorRole}>
                    Role: <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {sess.creator?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {sess.creator?.ratings > 0 && (
                  <div style={styles.rating}>
                    ⭐️ {sess.creator.ratings}
                  </div>
                )}
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.duration}>⏱ {sess.duration}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {sess.type === 'exchange' && (
                    <button 
                      onClick={() => handleOpenExchange(sess.creator)} 
                      className="btn btn-outline"
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      P2P Swap
                    </button>
                  )}
                  <button 
                    onClick={() => handleOpenBooking(sess)} 
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingSession && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ color: 'var(--text-primary)' }}>Book session: {bookingSession.title}</h2>
              <button style={styles.closeBtn} onClick={() => setBookingSession(null)}>✕</button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Host: {bookingSession.creator?.name} ({bookingSession.creator?.role?.replace('_', ' ')})
            </p>

            {bookingMessage && (
              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{bookingMessage}</div>
            )}

            <form onSubmit={handleBookSession}>
              <div className="form-group">
                <label className="form-label">Available Slots</label>
                <select 
                  className="form-control"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  {bookingSession.slots.map((slot, index) => (
                    <option key={index} value={slot}>{slot}</option>
                  ))}
                  <option value="custom">-- Choose custom date/time --</option>
                </select>
              </div>

              {(selectedSlot === 'custom' || bookingSession.slots.length === 0) && (
                <div className="form-group">
                  <label className="form-label">Enter Custom Date & Time Slot</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Wednesday 3:00 PM, 25th Aug"
                    value={customSlot}
                    onChange={(e) => setCustomSlot(e.target.value)}
                  />
                </div>
              )}

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setBookingSession(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Booking...' : bookingSession.type === 'paid' ? 'Proceed to Pay' : 'Request Exchange'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct P2P Skill Exchange Modal */}
      {exchangeTargetUser && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ color: 'var(--text-primary)' }}>Propose Skill Swap with {exchangeTargetUser.name}</h2>
              <button style={styles.closeBtn} onClick={() => setExchangeTargetUser(null)}>✕</button>
            </div>

            <form onSubmit={handleSendExchange}>
              <div className="form-group">
                <label className="form-label">Skill you offer to teach them</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Java coding, Guitar basics"
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skill you want to learn from them</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Photoshop, UI Design"
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Message</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  value={exchangeMsg}
                  onChange={(e) => setExchangeMsg(e.target.value)}
                />
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setExchangeTargetUser(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  disabled={exchangeLoading}
                >
                  {exchangeLoading ? 'Sending...' : 'Send Swap Proposal'}
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
  toolbar: {
    display: 'flex',
    gap: '20px',
    padding: '24px',
    marginBottom: '40px',
    flexWrap: 'wrap',
    border: '1px solid var(--border-glass)'
  },
  filterGroup: {
    flex: '1',
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontSize: '1.1rem'
  },
  categoryBadge: {
    fontSize: '0.8rem',
    color: 'var(--secondary)'
  },
  title: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)'
  },
  desc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    flex: '1',
    lineHeight: '1.5'
  },
  creatorInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)'
  },
  creatorName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  creatorRole: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  rating: {
    color: '#fbbf24',
    fontWeight: '600',
    fontSize: '0.85rem'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '16px'
  },
  duration: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
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
    marginBottom: '20px'
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

export default BrowseSessions;
