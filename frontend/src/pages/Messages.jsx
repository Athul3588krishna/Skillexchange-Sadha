import React, { useState, useEffect } from 'react';
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
    return (
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.skillsToTeach && u.skillsToTeach.some(s => s.toLowerCase().includes(q))) ||
      (u.skillsToLearn && u.skillsToLearn.some(s => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={styles.header}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>💬 Live Chat & Messaging Center</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Chat live with any mentor or peer student in real-time with instant 2-way Telegram sync.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spinner text="Loading contacts & users..." />
        </div>
      ) : (
        <div className="grid-2" style={styles.chatLayout}>
          {/* Left Column: User Directory */}
          <div className="glass-panel" style={styles.directoryCard}>
            <div style={styles.searchBox}>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search user by name or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              />
            </div>

            <div style={styles.userListScroll}>
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px 10px' }}>
                  No users found matching "{search}".
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUser && (selectedUser._id === u._id);
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
                      <div style={styles.userAvatar}>👤</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={styles.userName}>{u.name}</h4>
                          <span className={`badge ${
                            u.role === 'mentor' ? 'badge-success' :
                            u.role === 'skilled_user' ? 'badge-primary' : 'badge-secondary'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={styles.userBio}>
                          {u.skillsToTeach?.length > 0
                            ? `Teaches: ${u.skillsToTeach.join(', ')}`
                            : u.bio || 'Skill Exchange Member'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Embedded Chat Room */}
          <div className="glass-panel" style={styles.chatWindowContainer}>
            {selectedUser ? (
              <div style={{ width: '100%', height: '100%' }}>
                <div style={styles.activeUserBar}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                        {selectedUser.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        Role: {selectedUser.role.replace('_', ' ')} • Real-time Socket.io & Telegram active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Render LiveChatModal embedded */}
                <div style={{ height: '480px', position: 'relative' }}>
                  <LiveChatModal recipient={selectedUser} onClose={() => {}} embedded={true} />
                </div>
              </div>
            ) : (
              <div style={styles.emptyChatPlaceholder}>
                <span style={{ fontSize: '3rem' }}>💬</span>
                <h3 style={{ color: 'var(--text-primary)', marginTop: '12px' }}>Select a User to Start Live Chat</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Choose any mentor or peer from the directory on the left to begin instant messaging.
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
    gridTemplateColumns: '320px 1fr',
    alignItems: 'stretch',
    gap: '20px'
  },
  directoryCard: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '560px'
  },
  searchBox: {
    marginBottom: '14px'
  },
  userListScroll: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingRight: '4px'
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid var(--border-glass)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  userAvatar: {
    fontSize: '1.4rem'
  },
  userName: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    fontWeight: '600'
  },
  userBio: {
    margin: '3px 0 0 0',
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  chatWindowContainer: {
    padding: '0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '560px',
    borderRadius: '16px'
  },
  activeUserBar: {
    padding: '16px 20px',
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
