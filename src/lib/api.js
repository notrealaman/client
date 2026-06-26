const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const auth = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
};

export const trainers = {
  list: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/trainers${q ? `?${q}` : ''}`); },
  get: (id) => request(`/trainers/${id}`),
  specialties: () => request('/trainers/specialties'),
  stats: () => request('/trainers/stats'),
  trainees: () => request('/trainers/trainees'),
  assignTrainee: (traineeId) => request(`/trainers/trainees/${traineeId}/assign`, { method: 'POST' }),
  createSessionForTrainee: (traineeId, body) => request(`/trainers/trainees/${traineeId}/sessions`, { method: 'POST', body: JSON.stringify(body) }),
};

export const sessions = {
  list: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/sessions${q ? `?${q}` : ''}`); },
  create: (body) => request('/sessions', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/sessions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

export const workouts = {
  getLibrary: (category) => request(`/workouts/library${category ? `?category=${category}` : ''}`),
  getCategories: () => request('/workouts/library/categories'),
  getDays: (sessionId) => request(`/workouts/days/${sessionId}`),
  updateDay: (dayId, body) => request(`/workouts/days/${dayId}`, { method: 'PUT', body: JSON.stringify(body) }),
  getExercises: (dayId) => request(`/workouts/days/${dayId}/exercises`),
  addExercise: (dayId, body) => request(`/workouts/days/${dayId}/exercises`, { method: 'POST', body: JSON.stringify(body) }),
  updateExercise: (dayId, exerciseId, body) => request(`/workouts/days/${dayId}/exercises/${exerciseId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteExercise: (dayId, exerciseId) => request(`/workouts/days/${dayId}/exercises/${exerciseId}`, { method: 'DELETE' }),
};

export const diet = {
  list: (scope = 'all') => request(`/diet?scope=${scope}`),
  get: (id) => request(`/diet/${id}`),
  create: (body) => request('/diet', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/diet/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/diet/${id}`, { method: 'DELETE' }),
  addMeal: (planId, body) => request(`/diet/${planId}/meals`, { method: 'POST', body: JSON.stringify(body) }),
  updateMeal: (mealId, body) => request(`/diet/meals/${mealId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMeal: (mealId) => request(`/diet/meals/${mealId}`, { method: 'DELETE' }),
  addItem: (mealId, body) => request(`/diet/meals/${mealId}/items`, { method: 'POST', body: JSON.stringify(body) }),
  updateItem: (itemId, body) => request(`/diet/items/${itemId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteItem: (itemId) => request(`/diet/items/${itemId}`, { method: 'DELETE' }),
  generate: (body) => request('/diet/generate', { method: 'POST', body: JSON.stringify(body) }),
};

export const calories = {
  list: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/calories${q ? `?${q}` : ''}`); },
  log: (body) => request('/calories', { method: 'POST', body: JSON.stringify(body) }),
};

export const calendar = {
  get: (month, year) => request(`/calendar?month=${month}&year=${year}`),
};

export const messages = {
  conversations: () => request('/messages/conversations'),
  createConversation: (participantId) => request('/messages/conversations', { method: 'POST', body: JSON.stringify({ participantId }) }),
  getMessages: (conversationId) => request(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, content) => request(`/messages/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  unread: () => request('/messages/unread'),
};

export const reviews = { create: (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }) };

export const users = {
  profile: () => request('/users/profile'),
  profileById: (id) => request(`/users/${id}/profile`),
  update: (body) => request('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

export const uploads = {
  avatar: (formData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(`${API_BASE}/upload/avatar`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    }).then(r => r.json());
  },
};

export default request;
