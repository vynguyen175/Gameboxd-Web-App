import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import FeedPage from './components/FeedPage';
import ReviewPage from './components/ReviewPage';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import AdminPage from './components/AdminPage';
import UserProfilePage from './components/UserProfilePage';

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--deep-space);
  transition: background 0.3s ease;
`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('gameboxd_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('gameboxd_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gameboxd_user');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('gameboxd_user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <ThemeProvider>
        <AppContainer>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '2rem',
            color: 'var(--neon-purple)',
          }}>
            <span className="animate-pulse">Loading Gameboxd...</span>
          </div>
        </AppContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <AppContainer>
          {user && <Navigation user={user} onLogout={handleLogout} />}
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/home"
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/feed"
              element={user ? <FeedPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/review"
              element={user ? <ReviewPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/settings"
              element={user ? <SettingsPage user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin"
              element={user ? <AdminPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile/:username"
              element={user ? <UserProfilePage user={user} /> : <Navigate to="/login" />}
            />
            {/* Legacy route — redirect to home */}
            <Route
              path="/"
              element={user ? <Navigate to="/home" /> : <Navigate to="/login" />}
            />
            {/* Keep the old dashboard accessible at /community */}
            <Route
              path="/community"
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
            />
          </Routes>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
