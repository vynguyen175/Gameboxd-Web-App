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

// Response interceptor: handle errors
// Do NOT hard redirect on 401 — let App.js handle auth state
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

export const createReview = async (gameTitle, reviewText, rating, gameImageUrl = '', genre = '', igdbGameId = null, images = [], containsSpoilers = false) => {
  const response = await api.post('/reviews', { gameTitle, reviewText, rating, gameImageUrl, genre, igdbGameId, images, containsSpoilers });
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
  const response = await api.get('/games/search', { params: { q: query } });
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

export const getGameRecommendations = async (igdbId) => {
  const response = await api.get(`/games/${igdbId}/recommendations`);
  return response.data;
};

// ─── Search ─────────────────────────────────────────────────────────────────

export const searchAll = async (query, type) => {
  if (type === 'games') {
    const response = await api.get('/games/search', { params: { q: query } });
    return { results: response.data };
  } else if (type === 'users') {
    const response = await api.get('/users');
    const filtered = (response.data || []).filter(u =>
      u.username?.toLowerCase().includes(query.toLowerCase())
    );
    return { results: filtered };
  } else if (type === 'reviews') {
    const response = await api.get('/reviews', { params: { search: query } });
    const items = response.data.reviews || response.data || [];
    return { results: Array.isArray(items) ? items : [] };
  }
  return { results: [] };
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
    username: profileData.username,
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

export const getUserStats = async (username, year) => {
  const response = await api.get(`/users/${username}/stats`, { params: { year } });
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

export const getPrioritizedBacklog = async (username) => {
  const response = await api.get(`/game-status/user/${username}/prioritized`);
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

const getAdminHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem('gameboxd_user'));
    return { 'x-admin-username': user?.username || '' };
  } catch { return {}; }
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users', { headers: getAdminHeaders() });
  return response.data;
};

export const getAdminReviews = async () => {
  const response = await api.get('/admin/reviews', { headers: getAdminHeaders() });
  return response.data;
};

export const adminDeleteReview = async (reviewId) => {
  const response = await api.delete(`/admin/reviews/${reviewId}`, { headers: getAdminHeaders() });
  return response.data;
};

export const adminDeleteUser = async (username) => {
  const response = await api.delete(`/admin/users/${username}`, { headers: getAdminHeaders() });
  return response.data;
};

export const adminPromoteUser = async (username) => {
  const response = await api.post(`/admin/users/${username}/promote`, {}, { headers: getAdminHeaders() });
  return response.data;
};

export const adminBanUser = async (username) => {
  const response = await api.post(`/admin/users/${username}/ban`, {}, { headers: getAdminHeaders() });
  return response.data;
};

export const adminUnbanUser = async (username) => {
  const response = await api.post(`/admin/users/${username}/unban`, {}, { headers: getAdminHeaders() });
  return response.data;
};

export const adminCreateUser = async (userData) => {
  const response = await api.post('/admin/users', userData, { headers: getAdminHeaders() });
  return response.data;
};

export const getAdminReports = async () => {
  const response = await api.get('/admin/reports', { headers: getAdminHeaders() });
  return response.data;
};

export const resolveReport = async (reportId, status) => {
  const response = await api.put(`/admin/reports/${reportId}`, { status }, { headers: getAdminHeaders() });
  return response.data;
};

// ─── Featured Games ────────────────────────────────────────────────────────

export const getFeaturedGames = async () => {
  const response = await api.get('/games/featured');
  return response.data;
};

// ─── Steam Import ──────────────────────────────────────────────────────────

export const getSteamLibrary = async (steamId) => {
  const response = await api.get(`/steam/library/${steamId}`);
  return response.data;
};

export const linkSteamAccount = async (steamId) => {
  const response = await api.put('/steam/link', { steamId });
  return response.data;
};

export const unlinkSteamAccount = async () => {
  const response = await api.delete('/steam/link');
  return response.data;
};

export const getSteamProfile = async (steamId) => {
  const response = await api.get(`/steam/profile/${steamId}`);
  return response.data;
};

export const importSteamGames = async (games) => {
  const response = await api.post('/steam/import', { games });
  return response.data;
};

// ─── Admin Analytics ────────────────────────────────────────────────────────

export const getAnalyticsGrowth = async () => {
  const response = await api.get('/admin/analytics/growth', { headers: getAdminHeaders() });
  return response.data;
};

export const getAnalyticsEngagement = async () => {
  const response = await api.get('/admin/analytics/engagement', { headers: getAdminHeaders() });
  return response.data;
};

export const getAnalyticsTopGames = async () => {
  const response = await api.get('/admin/analytics/top-games', { headers: getAdminHeaders() });
  return response.data;
};

// ─── News ──────────────────────────────────────────────────────────────────

export const getNews = async () => {
  const response = await api.get('/news');
  return response.data;
};

// ─── Wishlist & Price Alerts ────────────────────────────────────────────────

export const getWishlist = async (username) => {
  const response = await api.get(`/wishlist/${username}`);
  return response.data;
};

export const createPriceAlert = async (data) => {
  const response = await api.post('/price-alerts', data);
  return response.data;
};

export const getPriceAlerts = async (username) => {
  const response = await api.get(`/price-alerts/${username}`);
  return response.data;
};

export const deletePriceAlert = async (id) => {
  const response = await api.delete(`/price-alerts/${id}`);
  return response.data;
};

// ─── Premium ───────────────────────────────────────────────────────────────

export const getPremiumStatus = async () => {
  const response = await api.get('/premium/status');
  return response.data;
};

export default api;
