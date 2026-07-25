import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Testimonials Carousel Mock
  const testimonials = [
    {
      quote: "SkillExchange helped me master React under a professional mentor. I booked 3 sessions and built a complete portfolio project!",
      author: "Adarsh Nair",
      role: "Beginner level to Junior Dev",
      avatar: "👨‍💻"
    },
    {
      quote: "I exchanged my photography skills for Python coding. It was completely free, highly collaborative, and saved me so much time!",
      author: "Meera Krishnan",
      role: "Skilled UI Designer",
      avatar: "👩‍🎨"
    },
    {
      quote: "As a verified mentor, this platform gives me a streamlined system to schedule sessions, verify certificates, and receive payouts.",
      author: "Dr. Rachel Mathews",
      role: "Professional DevOps Engineer",
      avatar: "👩‍🔬"
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch('/api/admin/categories');
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.data);
        }

        const sessRes = await fetch('/api/sessions');
        const sessData = await sessRes.json();
        if (sessData.success) {
          setSessions(sessData.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/sessions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* 1. RESTYLE HERO WITH SEARCH BAR */}
      <div style={styles.heroSection}>
        <div style={styles.glow1}></div>
        <div style={styles.glow2}></div>
        
        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroTextContent}>
            <span className="badge badge-primary" style={{ marginBottom: '16px' }}>
              ✨ Direct Skill-Swaps & Paid Mentorship
            </span>
            <h1 style={styles.heroTitle}>
              Learn from experts. <br />
              Swap skills <span className="gradient-text">for free</span>.
            </h1>
            <p style={styles.heroSubtitle}>
              Join a community of beginners, skilled professionals, and verified mentors. Register to book custom sessions, simulated payouts, and peer exchanges.
            </p>

            {/* Embedded Search Form */}
            <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
              <div style={styles.searchInputWrapper}>
                <span style={styles.searchIcon}>🔍</span>
                <input 
                  type="text" 
                  style={styles.searchInput} 
                  placeholder="What skill do you want to learn today? e.g. Python, UI Design..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={styles.searchBtn}>
                Search
              </button>
            </form>

            {/* Trending skills strip */}
            <div style={styles.trendingKeywords}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Trending:</span>
              <Link to="/sessions?search=React" style={styles.trendBadge}>React</Link>
              <Link to="/sessions?search=Python" style={styles.trendBadge}>Python</Link>
              <Link to="/sessions?search=Figma" style={styles.trendBadge}>Figma</Link>
              <Link to="/sessions?search=Spanish" style={styles.trendBadge}>Spanish</Link>
            </div>
          </div>

          {/* Hero Visual Block */}
          <div style={styles.heroVisual} className="glass-panel">
            <div style={styles.visualCardHeader}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Skill exchange statistics</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Updated real-time</p>
              </div>
            </div>
            
            <div style={styles.statsList}>
              <div style={styles.statRow}>
                <span>Learners Connected</span>
                <strong>5,240+</strong>
              </div>
              <div style={styles.statRow}>
                <span>Verified Mentors</span>
                <strong>140+</strong>
              </div>
              <div style={styles.statRow}>
                <span>Direct Skill Swaps</span>
                <strong style={{ color: 'var(--accent)' }}>FREE</strong>
              </div>
              <div style={styles.statRow}>
                <span>Average Review Score</span>
                <strong style={{ color: '#fbbf24' }}>⭐️ 4.8 / 5</strong>
              </div>
            </div>

            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', marginTop: '16px', fontSize: '0.9rem' }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY PILLS DIRECTORY */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Browse Classes by <span className="text-primary-color">Category</span></h2>
            <p style={styles.sectionSubtitle}>Select a category to filter active paid courses and direct exchanges</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading categories...</div>
          ) : (
            <div style={styles.categoryGrid}>
              {categories.map((cat) => (
                <Link 
                  key={cat._id} 
                  to={`/sessions?category=${cat._id}`} 
                  className="glass-panel-interactive" 
                  style={styles.categoryPill}
                >
                  <span style={styles.catEmoji}>
                    {cat.name.includes('Soft') ? '💻' : cat.name.includes('Des') ? '🎨' : cat.name.includes('Bus') ? '📈' : cat.name.includes('Lang') ? '📚' : '🎵'}
                  </span>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>{cat.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Explore courses</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURED LIVE SESSIONS */}
      <section style={{ ...styles.section, background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Featured Classes <span className="text-primary-color">Awaiting Booking</span></h2>
            <p style={styles.sectionSubtitle}>Join a session from a skilled peer or enroll in a verified professional mentor's class</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading courses...</div>
          ) : sessions.length === 0 ? (
            <div className="glass-panel" style={styles.emptyState}>
              <p>No active sessions are currently listed.</p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Host a Session</Link>
            </div>
          ) : (
            <div className="grid-3">
              {sessions.map((sess) => (
                <div key={sess._id} className="glass-panel-interactive" style={styles.sessionCard}>
                  <div style={styles.sessHeader}>
                    <span className={`badge ${sess.type === 'exchange' ? 'badge-secondary' : 'badge-primary'}`}>
                      {sess.type}
                    </span>
                    <span style={styles.sessPrice}>
                      {sess.type === 'exchange' ? 'Free swap' : `$${sess.price}`}
                    </span>
                  </div>
                  
                  <h3 style={styles.sessTitle}>{sess.title}</h3>
                  <p style={styles.sessDesc}>{sess.description.substring(0, 110)}...</p>
                  
                  <div style={styles.creatorInfo}>
                    <span style={{ fontSize: '1.2rem' }}>👤</span>
                    <div>
                      <div style={styles.creatorName}>{sess.creator?.name}</div>
                      <div style={styles.creatorRole}>{sess.creator?.role?.replace('_', ' ')}</div>
                    </div>
                    {sess.creator?.ratings > 0 && (
                      <span style={styles.ratingsBadge}>
                        ⭐️ {sess.creator.ratings}
                      </span>
                    )}
                  </div>

                  <div style={styles.sessFooter}>
                    <span style={styles.duration}>⏱ {sess.duration}</span>
                    <Link to={`/sessions`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                      Book Session
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. BECOME A MENTOR RECRUITMENT BANNER */}
      <section style={styles.bannerSection}>
        <div className="container" style={styles.bannerContainer}>
          <div style={styles.bannerText}>
            <h2>Share Your Knowledge. <br />Become a Professional Mentor</h2>
            <p>
              Upload your degrees or certifications to unlock verified mentor status. You can post paid courses, accept bookings, verify certificates, and generate income.
            </p>
            <Link to="/login" className="btn btn-secondary">
              Apply as Mentor
            </Link>
          </div>
          <div style={styles.bannerIllustration}>
            🎓
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS CAROUSEL */}
      <section style={styles.section}>
        <div className="container" style={styles.testimonialContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>What Our <span className="text-primary-color">Community</span> Says</h2>
            <p style={styles.sectionSubtitle}>Read reviews from learners and mentors exchanging knowledge worldwide</p>
          </div>

          <div className="glass-panel" style={styles.testimonialCard}>
            <div style={styles.testimonialAvatar}>
              {testimonials[activeTestimonial].avatar}
            </div>
            <p style={styles.testimonialQuote}>
              "{testimonials[activeTestimonial].quote}"
            </p>
            <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>
              {testimonials[activeTestimonial].author}
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {testimonials[activeTestimonial].role}
            </span>

            {/* Dots navigation */}
            <div style={styles.carouselDots}>
              {testimonials.map((_, i) => (
                <button 
                  key={i} 
                  style={{
                    ...styles.dot,
                    background: activeTestimonial === i ? 'var(--primary)' : 'var(--border-glass)'
                  }}
                  onClick={() => setActiveTestimonial(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  heroSection: {
    position: 'relative',
    padding: '80px 0 100px 0',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.03) 0%, rgba(248, 250, 252, 0) 100%)'
  },
  glow1: {
    position: 'absolute',
    top: '-150px',
    left: '10%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, rgba(0,0,0,0) 70%)',
    zIndex: -1
  },
  glow2: {
    position: 'absolute',
    bottom: '-100px',
    right: '10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, rgba(0,0,0,0) 70%)',
    zIndex: -1
  },
  heroContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '48px',
    flexWrap: 'wrap'
  },
  heroTextContent: {
    flex: '1.2',
    minWidth: '320px',
    textAlign: 'left'
  },
  heroTitle: {
    fontSize: '3.6rem',
    lineHeight: '1.15',
    color: 'var(--text-primary)',
    marginBottom: '20px'
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    marginBottom: '32px',
    maxWidth: '600px'
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
    background: '#ffffff',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04)',
    border: '1px solid var(--border-glass)',
    maxWidth: '650px',
    marginBottom: '24px'
  },
  searchInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: '1',
    paddingLeft: '12px'
  },
  searchIcon: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: 'var(--text-primary)'
  },
  searchBtn: {
    padding: '10px 24px'
  },
  trendingKeywords: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  trendBadge: {
    color: 'var(--primary)',
    background: 'var(--bg-secondary)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '500',
    padding: '4px 12px',
    borderRadius: '9999px',
    transition: 'all 0.15s ease'
  },
  heroVisual: {
    flex: '0.8',
    minWidth: '320px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignSelf: 'stretch',
    justifyContent: 'center',
    border: '1px solid var(--border-glass)'
  },
  visualCardHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '16px'
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
  },
  section: {
    padding: '80px 0'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '48px'
  },
  sectionTitle: {
    fontSize: '2.2rem',
    color: 'var(--text-primary)',
    marginBottom: '12px'
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.05rem'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px'
  },
  categoryPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderRadius: '12px',
    textDecoration: 'none',
    border: '1px solid var(--border-glass)'
  },
  catEmoji: {
    fontSize: '1.8rem',
    background: 'var(--bg-secondary)',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sessionCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sessHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sessPrice: {
    fontWeight: '700',
    fontSize: '1.1rem',
    color: 'var(--text-primary)'
  },
  sessTitle: {
    fontSize: '1.2rem',
    color: 'var(--text-primary)'
  },
  sessDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    flex: '1'
  },
  creatorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderTop: '1px solid var(--border-glass)',
    borderBottom: '1px solid var(--border-glass)'
  },
  creatorName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  creatorRole: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  ratingsBadge: {
    marginLeft: 'auto',
    fontSize: '0.8rem',
    color: '#fbbf24',
    fontWeight: 'bold'
  },
  sessFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  duration: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)'
  },
  bannerSection: {
    padding: '80px 0',
    background: 'linear-gradient(135deg, var(--primary), #312e81)',
    color: 'white'
  },
  bannerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '40px',
    flexWrap: 'wrap'
  },
  bannerText: {
    flex: '1.5',
    minWidth: '320px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px'
  },
  bannerIllustration: {
    fontSize: '8rem',
    flex: '0.5',
    textAlign: 'center',
    animation: 'float 3s ease-in-out infinite'
  },
  testimonialContainer: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  testimonialCard: {
    padding: '48px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  testimonialAvatar: {
    fontSize: '3rem',
    background: 'var(--bg-secondary)',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-glass)'
  },
  testimonialQuote: {
    fontSize: '1.25rem',
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '650px'
  },
  carouselDots: {
    display: 'flex',
    gap: '8px',
    marginTop: '24px'
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  }
};

// Add media queries and banner headings overrides
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .trendBadge:hover {
      background: var(--primary) !important;
      color: white !important;
    }
    @media (max-width: 768px) {
      h1[style*="font-size: 3.6rem"] {
        font-size: 2.3rem !important;
      }
      .bannerText h2 {
        font-size: 1.8rem !important;
      }
    }
    .bannerText h2 {
      font-size: 2.4rem;
      color: white;
      font-family: var(--font-display);
      font-weight: 700;
      line-height: 1.2;
    }
    .bannerText p {
      color