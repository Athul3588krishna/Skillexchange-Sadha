import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import BrowseSessions from './pages/BrowseSessions';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Helper component for authenticated routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loading}>Verifying authentication session...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Helper component for admin-only routes
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loading}>Verifying admin authorization...</div>;
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

// Helper component for mentor-access routes
const MentorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loading}>Verifying mentor credentials...</div>;
  const isAuthorized = user && (user.role === 'mentor' || user.role === 'admin' || user.role === 'skilled_user');
  return isAuthorized ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <Router>
      <div style={styles.appContainer}>
        <Navbar />
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/sessions" element={<BrowseSessions />} />
            
            {/* Authenticated Routes */}
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/checkout/:id" 
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              } 
            />

            {/* Role-Specific Protected Routes */}
            <Route 
              path="/mentor" 
              element={
                <MentorRoute>
                  <MentorDashboard />
                </MentorRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer style={styles.footer}>
          <div className="container" style={styles.footerContainer}>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
              &copy; 2026 SkillExchange Platform. All rights reserved. Built using MERN Stack & Glassmorphism design guidelines.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#0a0b10'
  },
  mainContent: {
    flex: '1 0 auto'
  },
  loading: {
    textAlign: 'center',
    padding: '80px',
    color: '#9ca3af',
    background: '#0a0b10',
    minHeight: '100vh'
  },
  footer: {
    background: 'rgba(10, 11, 16, 0.8)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    padding: '24px 0',
    marginTop: 'auto'
  },
  footerContainer: {
    textAlign: 'center'
  }
};

export default App;
