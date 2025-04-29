import axios from 'axios';
import { addAuthInterceptor } from '../axiosAuthInterceptor';

const userApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

addAuthInterceptor(userApi);

export const googleOauth = async (request) => {
  const response = await userApi.post('/oauth/google', request);
  return response.data;
};

export const getUsers = async (filters) => {
  const response = await userApi.get('/users', { params: filters });
  return response.data.expenses;
};

export const updateExpense = async (id, expense) => {
  const response = await userApi.put(`/expenses/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await userApi.delete(`/expenses/${id}`);
  return response.data;
};

export const getSummary = async (userId, period, startDate, endDate) => {
  const response = await userApi.get('/expenses/summary', {
    params: { userId, period, startDate, endDate },
  });
  return response.data.summaries;
};