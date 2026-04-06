import api from './api';

export async function fetchGamingNews() {
  const response = await api.get('/news');
  return response.data;
}

export async function fetchGamingVideos() {
  const response = await api.get('/news/videos');
  return response.data;
}
