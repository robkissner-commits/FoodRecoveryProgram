import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Events API
export const eventsAPI = {
  getAll: (params?: any) => api.get('/events', { params }),
  getById: (id: number) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: number, data: any) => api.put(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
  assignReporter: (id: number) => api.post(`/events/${id}/assign`),
  unassignReporter: (id: number) => api.post(`/events/${id}/unassign`),
  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/events/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Recovery Reports API
export const recoveriesAPI = {
  getAll: (params?: any) => api.get('/recoveries', { params }),
  getById: (id: number) => api.get(`/recoveries/${id}`),
  create: (data: any, photos?: File[]) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    if (photos) {
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }
    return api.post('/recoveries', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: number, data: any) => api.put(`/recoveries/${id}`, data),
};

// Deliveries API
export const deliveriesAPI = {
  getAll: (params?: any) => api.get('/deliveries', { params }),
  getById: (id: number) => api.get(`/deliveries/${id}`),
  accept: (recovery_report_id: number) => api.post('/deliveries', { recovery_report_id }),
  updateStatus: (id: number, status: string, photo?: File, issues?: string) => {
    const formData = new FormData();
    formData.append('status', status);
    if (photo) {
      formData.append('photo', photo);
    }
    if (issues) {
      formData.append('issues', issues);
    }
    return api.put(`/deliveries/${id}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  cancel: (id: number, reason?: string) => api.post(`/deliveries/${id}/cancel`, { reason }),
};

// Partners API
export const partnersAPI = {
  getAll: (params?: any) => api.get('/partners', { params }),
  getById: (id: number) => api.get(`/partners/${id}`),
  create: (data: any) => api.post('/partners', data),
  update: (id: number, data: any) => api.put(`/partners/${id}`, data),
  updateNeedLevel: (id: number, current_need_level: string) =>
    api.patch(`/partners/${id}/need-level`, { current_need_level }),
  delete: (id: number) => api.delete(`/partners/${id}`),
  getDeliveries: (id: number) => api.get(`/partners/${id}/deliveries`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
};

// Dashboard API
export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin'),
  getReporter: () => api.get('/dashboard/reporter'),
  getDriver: () => api.get('/dashboard/driver'),
  getPartner: () => api.get('/dashboard/partner'),
};
