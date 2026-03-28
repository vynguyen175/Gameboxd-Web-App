import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeProvider } from './contexts/ThemeContext';
import { getMe } from './services/api';
import Login from './components/Login';
import Navigation from './components/Navigation';
import FeedPage from './components/FeedPage';
import ReviewPage from './components/ReviewPage';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import AdminPage from './components/AdminPage';
import UserProfilePage from './components/UserProfilePage';
import SearchPage from './components/SearchPage';
import GamePage from './components/GamePage';
import GameListPage from './components/GameListPage';
import MyListsPage from './components/MyListsPage';
import BacklogPage from './components/BacklogPage';
import NotificationsPage from './components/NotificationsPage';
import MessagesPage from './components/MessagesPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import SharedReviewPage from './components/SharedReviewPage';
import DateOfBirthPrompt from './components/DateOfBirthPrompt';

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--deep-space);
  transition: background 0.3s ease;
`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('gameboxd_token');
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
          localStorage.setItem('gameboxd_user', JSON.stringify(userData));
        } catch (err) {
          // Token invalid, clear it
          localStorage.removeItem('gameboxd_token');
          localStorage.removeItem('gameboxd_user');
        }
      } else {
        // No token = not authenticated. Clear any stale user data.
        localStorage.removeItem('gameboxd_user');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = (userData) => {
    // userData may contain token and user from JWT response
    const userObj = userData.user || userData;
    setUser(userObj);
    localStorage.setItem('gameboxd_user', JSON.stringify(userObj));
    if (userData.token) {
      localStorage.setItem('gameboxd_token', userData.token);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gameboxd_user');
    localStorage.removeItem('gameboxd_token');
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
          {user && !user.dateOfBirth && (
            <DateOfBirthPrompt user={user} onComplete={handleUserUpdate} />
          )}
          {user && <Navigation user={user} onLogout={handleLogout} />}
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={user ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />}
            />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/review/:id" element={<SharedReviewPage />} />

            {/* Protected routes */}
            <Route
              path="/home"
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/feed"
              element={user ? <FeedPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/write-review"
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
            <Route
              path="/search"
              element={user ? <SearchPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/game/:igdbId"
              element={user ? <GamePage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/lists/:id"
              element={user ? <GameListPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/my-lists"
              element={user ? <MyListsPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/backlog"
              element={user ? <BacklogPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/notifications"
              element={user ? <NotificationsPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/messages"
              element={user ? <MessagesPage user={user} /> : <Navigate to="/login" />}
            />

            {/* Legacy routes */}
            <Route
              path="/"
              element={user ? <Navigate to="/home" /> : <Navigate to="/login" />}
            />
            <Route
              path="/community"
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
            />
            {/* Keep old /review route working */}
            <Route
              path="/review"
              element={user ? <ReviewPage user={user} /> : <Navigate to="/login" />}
            />
          </Routes>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
