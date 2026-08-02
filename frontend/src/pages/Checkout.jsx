import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const Checkout = () => {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Mock Card Form States
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const res = await authFetch('/api/bookings');
        const data = await res.json();
        if (data.success) {
          // Find the specific booking in the user's booking list
          const found = data.data.find(b => b._id === id);
          if (found) {
            setBooking(found);
          } else {
            setMessage('❌ Booking not found.');
          }
        }
      } catch (err) {
        console.error(err);
        setMessage('❌ Error loading booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      setMessage('Please fill in all card details.');
      return;
    }

    setPayLoading(true);
    setMessage('');
    try {
      const res = await authFetch(`/api/bookings/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ cardNumber, cardHolder, expiry, cvv })
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Payment successful! Your session is confirmed.');
        navigate('/dashboard');
      } else {
        setMessage(data.message || 'Payment failed.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Payment server error. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <Spinner fullPage text="Loading checkout details..." />
      </div>
    );
  }

  // Already paid — show success state instead of form
  if (booking && booking.paymentStatus === 'paid') {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '56px 40px', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '4rem' }}>🎉</div>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Payment Confirmed!</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            You have already paid for <strong>{booking.session?.title}</strong>.
            Your booking is <span className="badge badge-success" style={{ verticalAlign: 'middle', fontSize: '0.85rem' }}>{booking.status}</span>.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn btn-primary">Go to My Dashboard</Link>
            <Link to="/sessions" className="btn btn-outline">Browse More Sessions</Link>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '16px 20px', width: '100%', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Transaction ID:</span>
              <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{booking.paymentId || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Amount Paid:</span>
              <strong style={{ color: 'var(--text-primary)' }}>${booking.amountPaid}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: '#ef4444', fontSize: '1.1rem' }}>{message || 'Booking not found.'}</p>
          <button className="btn btn-outline" style={{ marginTop: '20px' }} onClick={() => navigate('/sessions')}>
            Go Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={styles.grid} className="grid-2">
        {/* Left Side: Order Summary */}
        <div className="glass-panel" style={styles.summaryCard}>
          <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>Order Summary</span>
          <h2 style={{ color: 'var(--text-primary)', marginTop: '16px' }}>{booking.session?.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '8px 0 24px 0' }}>
            {booking.session?.description}
          </p>

          <div style={styles.detailsBlock}>
            <div style={styles.detailRow}>
              <span>Mentor:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{booking.mentor?.name}</strong>
            </div>
            <div style={styles.detailRow}>
              <span>Scheduled Slot:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{booking.scheduledTime}</strong>
            </div>
            <div style={styles.detailRow}>
              <span>Duration:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{booking.session?.duration}</strong>
            </div>
          </div>

          <div style={styles.priceBlock}>
            <span>Total Amount Due:</span>
            <span style={styles.priceTag}>${booking.amountPaid}</span>
          </div>
        </div>

        {/* Right Side: Simulated Payment Form */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={styles.formHeader}>
            <h3 style={{ color: 'var(--text-primary)' }}>Simulated Checkout</h3>
            <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>Test Mode</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Enter any mock card details to process your simulated enrollment.
          </p>

          {message && (
            <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#ef4444' }}>
              {message}
            </div>
          )}

          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="John Doe"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="4111 2222 3333 4444"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Expiry (MM/YY)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="12/28"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CVV</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.alertNotice}>
              🔒 Secure simulation. No real money or actual credit card information will be processed.
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '16px' }}
              disabled={payLoading}
            >
              {payLoading ? 'Processing simulated transfer...' : `Pay $${booking.amountPaid}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  grid: {
    alignItems: 'start'
  },
  summaryCard: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column'
  },
  detailsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: 'var(--bg-secondary)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid var(--border-glass)'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
  },
  priceBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-glass)'
  },
  priceTag: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'Outfit, sans-serif'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  alertNotice: {
    background: 'var(--primary-glow)',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: 'var(--primary)',
    lineHeight: '1.4',
    marginTop: '8px',
    border: '1px solid var(--border-glass)'
  }
};

export default Checkout;
