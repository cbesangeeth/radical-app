import axios from 'axios';
import { addAuthInterceptor } from '../axiosAuthInterceptor';

const expenseApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

addAuthInterceptor(expenseApi);

export const addExpense = async (expense) => {
  const response = await expenseApi.post('/expenses', expense);
  return response.data;
};

export const getExpenses = async (filters) => {
  const response = await expenseApi.get('/expenses', { params: filters });
  return response.data.expenses;
};

export const updateExpense = async (id, expense) => {
  const response = await expenseApi.put(`/expenses/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await expenseApi.delete(`/expenses/${id}`);
  return response.data;
};

export const getSummary = async (userId, period, startDate, endDate) => {
  const response = await expenseApi.get('/expenses/summary', {
    params: { userId, period, startDate, endDate },
  });
  return response.data.summaries;
};