import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (username, password, email, fullName) => {
  const response = await api.post('/auth/register', { username, password, email, fullName });
  return response.data;
};

// Reviews
export const getAllReviews = async () => {
  const response = await api.get('/reviews');
  return response.data;
};

export const getUserReviews = async (username) => {
  const response = await api.get(`/reviews/user/${username}`);
  return response.data;
};

export const createReview = async (gameTitle, reviewText, rating, username, gameImageUrl = '') => {
  const response = await api.post('/reviews', { gameTitle, reviewText, rating, username, gameImageUrl });
  return response.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.imageUrl;
};

export const deleteReview = async (id, username) => {
  const response = await api.delete(`/reviews/${id}`, { data: { username } });
  return response.data;
};

// Votes
export const voteOnReview = async (reviewId, username, voteType) => {
  const response = await api.post(`/reviews/${reviewId}/vote`, { username, voteType });
  return response.data;
};

export const removeVote = async (reviewId, username) => {
  const response = await api.delete(`/reviews/${reviewId}/vote`, { data: { username } });
  return response.data;
};

export const getVoteStatus = async (reviewId, username) => {
  const response = await api.get(`/reviews/${reviewId}/vote/${username}`);
  return response.data;
};

// Comments
export const getComments = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}/comments`);
  return response.data;
};

export const addComment = async (reviewId, username, text) => {
  const response = await api.post(`/reviews/${reviewId}/comments`, { username, text });
  return response.data;
};

export const deleteComment = async (reviewId, commentId, username) => {
  const response = await api.delete(`/reviews/${reviewId}/comments/${commentId}`, {
    data: { username }
  });
  return response.data;
};

// Games
export const getTrendingGames = async () => {
  const response = await api.get('/games/trending');
  return response.data;
};

// Users & Follow
export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const followUser = async (targetUsername, followerUsername) => {
  const response = await api.post(`/users/${targetUsername}/follow`, { followerUsername });
  return response.data;
};

export const unfollowUser = async (targetUsername, followerUsername) => {
  const response = await api.delete(`/users/${targetUsername}/follow`, { data: { followerUsername } });
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

// User Profile
export const getUserProfile = async (username) => {
  const response = await api.get(`/auth/profile/${username}`);
  return response.data;
};

export const updateUserProfile = async (username, profileData) => {
  const response = await api.put('/auth/profile', {
    username,
    fullName: profileData.fullName,
    email: profileData.email,
    bio: profileData.bio,
    profilePicture: profileData.profilePhoto,
  });
  return response.data.user;
};

// Admin APIs
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

export default api;
