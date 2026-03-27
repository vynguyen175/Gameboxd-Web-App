import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gameboxd_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('gameboxd_token');
      localStorage.removeItem('gameboxd_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Authentication ─────────────────────────────────────────────────────────

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.token) {
    localStorage.setItem('gameboxd_token', response.data.token);
  }
  return response.data;
};

export const register = async (username, password, email, fullName, dateOfBirth) => {
  const response = await api.post('/auth/register', { username, password, email, fullName, dateOfBirth });
  if (response.data.token) {
    localStorage.setItem('gameboxd_token', response.data.token);
  }
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await api.post('/auth/google', { credential });
  if (response.data.token) {
    localStorage.setItem('gameboxd_token', response.data.token);
  }
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

// ─── Reviews ────────────────────────────────────────────────────────────────

export const getAllReviews = async (params = {}) => {
  const response = await api.get('/reviews', { params });
  return response.data;
};

export const getUserReviews = async (username) => {
  const response = await api.get(`/reviews/user/${username}`);
  return response.data;
};

export const createReview = async (gameTitle, reviewText, rating, gameImageUrl = '', genre = '', igdbGameId = null, images = []) => {
  const response = await api.post('/reviews', { gameTitle, reviewText, rating, gameImageUrl, genre, igdbGameId, images });
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};

// ─── Votes ──────────────────────────────────────────────────────────────────

export const voteOnReview = async (reviewId, voteType) => {
  const response = await api.post(`/reviews/${reviewId}/vote`, { voteType });
  return response.data;
};

export const removeVote = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}/vote`);
  return response.data;
};

export const getVoteStatus = async (reviewId, username) => {
  const response = await api.get(`/reviews/${reviewId}/vote/${username}`);
  return response.data;
};

// ─── Comments ───────────────────────────────────────────────────────────────

export const getComments = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}/comments`);
  return response.data;
};

export const addComment = async (reviewId, text) => {
  const response = await api.post(`/reviews/${reviewId}/comments`, { text });
  return response.data;
};

export const deleteComment = async (reviewId, commentId) => {
  const response = await api.delete(`/reviews/${reviewId}/comments/${commentId}`);
  return response.data;
};

// ─── Reactions ──────────────────────────────────────────────────────────────

export const getReactions = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}/reactions`);
  return response.data;
};

export const toggleReaction = async (reviewId, emoji) => {
  const response = await api.post(`/reviews/${reviewId}/reactions`, { emoji });
  return response.data;
};

// ─── Report & Share ─────────────────────────────────────────────────────────

export const reportReview = async (reviewId, data) => {
  const response = await api.post(`/reviews/${reviewId}/report`, data);
  return response.data;
};

export const getShareData = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}/share`);
  return response.data;
};

// ─── Genres ─────────────────────────────────────────────────────────────────

export const getGenres = async () => {
  const response = await api.get('/genres');
  return response.data;
};

// ─── Upload ─────────────────────────────────────────────────────────────────

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.imageUrl;
};

// ─── Games ──────────────────────────────────────────────────────────────────

export const getTrendingGames = async () => {
  const response = await api.get('/games/trending');
  return response.data;
};

export const searchGames = async (query) => {
  const response = await api.get('/games/search', { params: { query } });
  return response.data;
};

export const getGame = async (igdbId) => {
  const response = await api.get(`/games/${igdbId}`);
  return response.data;
};

export const getGameReviews = async (igdbId, params = {}) => {
  const response = await api.get(`/games/${igdbId}/reviews`, { params });
  return response.data;
};

// ─── Search ─────────────────────────────────────────────────────────────────

export const searchAll = async (query, type) => {
  const response = await api.get('/search', { params: { query, type } });
  return response.data;
};

// ─── Users & Follow ─────────────────────────────────────────────────────────

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const followUser = async (targetUsername) => {
  const response = await api.post(`/users/${targetUsername}/follow`);
  return response.data;
};

export const unfollowUser = async (targetUsername) => {
  const response = await api.delete(`/users/${targetUsername}/follow`);
  return response.data;
};

export const getFollowing = async (username) => {
  const response = await api.get(`/users/${username}/following`);
  return response.data;
};

export const getFollowers = async (username) => {
  const response = await api.get(`/users/${username}/followers`);
  return response.data;
};

export const getFeed = async (username) => {
  const response = await api.get(`/users/${username}/feed`);
  return response.data;
};

// ─── User Profile ───────────────────────────────────────────────────────────

export const getUserProfile = async (username) => {
  const response = await api.get(`/auth/profile/${username}`);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/auth/profile', {
    fullName: profileData.fullName,
    email: profileData.email,
    bio: profileData.bio,
    profilePicture: profileData.profilePhoto,
    dateOfBirth: profileData.dateOfBirth,
  });
  return response.data.user;
};

// ─── User Achievements & Activity ───────────────────────────────────────────

export const getUserAchievements = async (username) => {
  const response = await api.get(`/users/${username}/achievements`);
  return response.data;
};

export const getUserActivity = async (username, cursor) => {
  const response = await api.get(`/users/${username}/activity`, { params: { cursor } });
  return response.data;
};

// ─── Lists ──────────────────────────────────────────────────────────────────

export const getUserLists = async (username) => {
  const response = await api.get(`/lists/user/${username}`);
  return response.data;
};

export const createList = async (data) => {
  const response = await api.post('/lists', data);
  return response.data;
};

export const getList = async (id) => {
  const response = await api.get(`/lists/${id}`);
  return response.data;
};

export const updateList = async (id, data) => {
  const response = await api.put(`/lists/${id}`, data);
  return response.data;
};

export const addGameToList = async (listId, game) => {
  const response = await api.post(`/lists/${listId}/games`, game);
  return response.data;
};

export const removeGameFromList = async (listId, igdbGameId) => {
  const response = await api.delete(`/lists/${listId}/games/${igdbGameId}`);
  return response.data;
};

export const deleteList = async (id) => {
  const response = await api.delete(`/lists/${id}`);
  return response.data;
};

// ─── Game Status (Backlog) ──────────────────────────────────────────────────

export const setGameStatus = async (data) => {
  const response = await api.post('/game-status', data);
  return response.data;
};

export const getUserGameStatuses = async (username, status) => {
  const response = await api.get(`/game-status/user/${username}`, { params: { status } });
  return response.data;
};

export const getMyGameStatus = async (igdbGameId) => {
  const response = await api.get(`/game-status/${igdbGameId}`);
  return response.data;
};

export const removeGameStatus = async (igdbGameId) => {
  const response = await api.delete(`/game-status/${igdbGameId}`);
  return response.data;
};

// ─── Notifications ──────────────────────────────────────────────────────────

export const getNotifications = async (cursor) => {
  const response = await api.get('/notifications', { params: { cursor } });
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

// ─── Conversations / Messages ───────────────────────────────────────────────

export const getConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export const startConversation = async (username) => {
  const response = await api.post('/conversations', { username });
  return response.data;
};

export const getMessages = async (conversationId, cursor) => {
  const response = await api.get(`/conversations/${conversationId}/messages`, { params: { cursor } });
  return response.data;
};

export const sendMessage = async (conversationId, text) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, { text });
  return response.data;
};

export const markConversationRead = async (conversationId) => {
  const response = await api.put(`/conversations/${conversationId}/read`);
  return response.data;
};

// ─── Admin ──────────────────────────────────────────────────────────────────

export const getAdminUsers = async (adminUsername) => {
  const response = await api.get('/admin/users', {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export const getAdminReviews = async (adminUsername) => {
  const response = await api.get('/admin/reviews', {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export const adminDeleteReview = async (reviewId, adminUsername) => {
  const response = await api.delete(`/admin/reviews/${reviewId}`, {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export const adminDeleteUser = async (username, adminUsername) => {
  const response = await api.delete(`/admin/users/${username}`, {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export const adminPromoteUser = async (username, adminUsername) => {
  const response = await api.post(`/admin/users/${username}/promote`, {}, {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export const adminBanUser = async (username, adminUsername) => {
  const response = await api.post(`/admin/users/${username}/ban`, {}, {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export const adminUnbanUser = async (username, adminUsername) => {
  const response = await api.post(`/admin/users/${username}/unban`, {}, {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export const adminCreateUser = async (userData, adminUsername) => {
  const response = await api.post('/admin/users', userData, {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export const getAdminReports = async (adminUsername) => {
  const response = await api.get('/admin/reports', {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export const resolveReport = async (reportId, status, adminUsername) => {
  const response = await api.put(`/admin/reports/${reportId}`, { status }, {
    headers: { 'x-admin-username': adminUsername }
  });
  return response.data;
};

export default api;
