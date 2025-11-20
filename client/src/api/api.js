import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Leads API
export const leadsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/leads?${params.toString()}`);
  },

  getById: (id) => api.get(`/leads/${id}`),

  create: (data) => api.post('/leads', data),

  update: (id, data) => api.put(`/leads/${id}`, data),

  delete: (id) => api.delete(`/leads/${id}`),

  getStats: () => api.get('/leads/stats')
};

// Scraping API
export const scrapeAPI = {
  scrape: (data) => api.post('/scrape', data),

  getIndustries: () => api.get('/scrape/industries'),

  getLocations: () => api.get('/scrape/locations')
};

// Export API
export const exportAPI = {
  exportExcel: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/export/excel?${params.toString()}`, { responseType: 'blob' });
  },

  exportCSV: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/export/csv?${params.toString()}`, { responseType: 'blob' });
  }
};

export default api;
