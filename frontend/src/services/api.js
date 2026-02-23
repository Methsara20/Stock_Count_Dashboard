import axios from 'axios';

const api = axios.create({
  baseURL: '/',   // ⭐ IMPORTANT
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardData = async () => {
  try {
    const response = await api.get('/api/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export default api;
