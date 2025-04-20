import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const addExpense = async (expense) => {
  const response = await api.post('/expenses', expense);
  return response.data;
};

export const getExpenses = async (filters) => {
  const response = await api.get('/expenses', { params: filters });
  return response.data.expenses;
};

export const updateExpense = async (id, expense) => {
  const response = await api.put(`/expenses/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export const getSummary = async (userId, period, startDate, endDate) => {
  const response = await api.get('/expenses/summary', {
    params: { userId, period, startDate, endDate },
  });
  return response.data.summaries;
};