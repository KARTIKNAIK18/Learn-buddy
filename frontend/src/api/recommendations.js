import api from './axiosInstance';

// GET /recommendations → personalized activity recommendations
export const getRecommendations = () => api.get('/recommendations');
