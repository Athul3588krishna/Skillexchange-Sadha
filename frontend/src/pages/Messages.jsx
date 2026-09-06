import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/Spinner';
import LiveChatModal from '../components/LiveChatModal';

const Messages = () => {
  const { user, authFetch } = useAuth();
  const { socket } = useSocket();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/auth/users');
      const data = await res.json();
      if (data.success && data.data) {
        setUsersList(data.data);
        // Default select first user if available
        if (data.data.length > 0 && !selectedUser) {
          setSelectedUser(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching users for chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const q = search.toLowerCase();
    const matchesName = u.name.toLowerCase().includes(q);
    const matchesRole = u.role?.toLowerCase().includes(q);
    const matchesContext = u.contextReason?.toLowerCase().includes(q);
    const matchesTeach = u.skillsToTeach && u.skillsToTeach.some(s => s.toLowerCase().includes(q));
    const matchesLearn = u.skillsToLearn && u.skillsToLearn.some(s => s.toLowerCase().includes(q));
    return matchesName || matchesRole || matchesContext || matchesTeach || matchesLearn;
  });

  const isAdmin = user?.role === 'admin';
  const peerContactsCount = usersList.filter(u => u.role !== 'admin').length;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              💬 Live Chat & Messaging Center
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              {isAdmin 
                ? '👑 Administrator Channel: Direct 1-on-1 moderation & support with all platform users'
                : '🔒 Verified Scenario Chat: Real-time messaging with your booked mentors, learners, exchange partners, and support'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchUsers} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              🔄 Refresh Contacts
            </button>
            {!isAdmin && (
              <Link to="/sessions" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                + Book New Class / Swap
              </Link>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spinner text="Loading authorized contacts..." />
        </div>
      ) : (
        <div className="grid-2" style={styles.chatLayout}>
          {/* Left Column: Authorized Contacts Directory */}
          <div className="glass-panel" style={styles.directoryCard}>
            <div style={styles.searchBox}>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search contacts by name, skill, or session..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              />
            </div>

            <div style={styles.userListScroll}>
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px 10px' }}>
                  {search ? `No contacts matching "${search}".` : 'No authorized contacts found.'}
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUser && (selectedUser._id === u._id);
                  const isContactAdmin = u.role === 'admin';
                  return (
                    <div
                      key={u._id}
                      onClick={() => setSelectedUser(u)}
                      style={{
                        ...styles.userItem,
                        background: isSelected ? 'var(--primary-glow)' : 'transparent',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border-glass)'
                      }}
                    >
                      <div style={styles.userAvatar}>
                        {isContactAdmin ? '🛡️' : u.role === 'mentor' ? '🎓' : '👤'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                          <h4 style={styles.userName}>{u.name}</h4>
                          <span className={`badge ${
                            isContactAdmin ? 'badge-danger' :
                            u.role === 'mentor' ? 'badge-success' :
                            u.role === 'skilled_user' ? 'badge-primary' : 'badge-secondary'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {u.role?.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Scenario Context Badge / Reason */}
                        <div style={styles.contextBadge}>
                          {u.contextReason || (isContactAdmin ? '🛡️ Platform Support Admin' : 'Active Contact')}
                        </div>

                        {u.bio && (
                          <p style={styles.userBio}>
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Helpful footer in contact list if student has no peer bookings yet */}
              {!isAdmin && peerContactsCount === 0 && (
                <div style={styles.emptyNoticeCard}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    💡 <strong>Tip:</strong> Book a mentor session or send a skill swap proposal from the <Link to="/sessions" style={{ color: 'var(--primary)' }}>Browse Sessions</Link> page to unlock 1-on-1 peer chats!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Embedded Real-time Chat Room */}
          <div className="glass-panel" style={styles.chatWindowContainer}>
            {selectedUser ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={styles.activeUserBar}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.6rem' }}>
                      {selectedUser.role === 'admin' ? '🛡️' : selectedUser.role === 'mentor' ? '🎓' : '👤'}
                    </span>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedUser.name}
                        <span className={`badge ${
                          selectedUser.role === 'admin' ? 'badge-danger' :
                          selectedUser.role === 'mentor' ? 'badge-success' :
                          selectedUser.role === 'skilled_user' ? 'badge-primary' : 'badge-secondary'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {selectedUser.role?.replace('_', ' ')}
                        </span>
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '2px', display: 'block' }}>
                        {selectedUser.contextReason || 'Authorized Interaction Channel'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Render LiveChatModal embedded */}
                <div style={{ flex: 1, minHeight: '420px', position: 'relative' }}>
                  <LiveChatModal recipient={selectedUser} onClose={() => {}} embedded={true} />
                </div>
              </div>
            ) : (
              <div style={styles.emptyChatPlaceholder}>
                <span style={{ fontSize: '3rem' }}>💬</span>
                <h3 style={{ color: 'var(--text-primary)', marginTop: '12px' }}>Select an Authorized Contact</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', lineHeight: '1.5' }}>
                  Choose any mentor, student, or platform administrator from your authorized list on the left to start live messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '24px'
  },
  chatLayout: {
    gridTemplateColumns: '350px 1fr',
    alignItems: 'stretch',
    gap: '20px'
  },
  directoryCard: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '600px'
  },
  searchBox: {
    marginBottom: '14px'
  },
  userListScroll: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '4px'
  },
  userItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid var(--border-glass)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  userAvatar: {
    fontSize: '1.5rem',
    marginTop: '2px'
  },
  userName: {
    margin: 0,
    fontSize: '0.92rem',
    color: 'var(--text-primary)',
    fontWeight: '600'
  },
  contextBadge: {
    fontSize: '0.73rem',
    color: 'var(--primary)',
    marginTop: '3px',
    fontWeight: '500',
    lineHeight: '1.3'
  },
  userBio: {
    margin: '4px 0 0 0',
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  emptyNoticeCard: {
    marginTop: 'auto',
    padding: '12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px dashed var(--border-glass)'
  },
  chatWindowContainer: {
    padding: '0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
    borderRadius: '16px'
  },
  activeUserBar: {
    padding: '14px 20px',
    borderBottom: '1px solid var(--border-glass)',
    background: 'var(--bg-secondary)'
  },
  emptyChatPlaceholder: {
    textAlign: 'center',
    margin: 'auto 0',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
};

export default Messages;

