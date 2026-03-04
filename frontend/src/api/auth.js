import api from './axiosInstance';

// POST /auth/login  → { access_token, role, email, token_type }
export const loginUser   = (data)  => api.post('/auth/login', data);

// POST /auth/signup/ → { id, name, email, role, created_at }
export const signupUser  = (data)  => api.post('/auth/signup/', data);
