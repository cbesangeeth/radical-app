import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { addExpense, updateExpense, getExpenses } from '../utils/api/expenseApi';

function ExpenseForm() {
  const { id } = useParams(); // For editing
  const navigate = useNavigate();
  const [expense, setExpense] = useState({
    userId: 1, // Hardcoded for 1-2 users; replace with user context if needed
    amount: '', // Store as string for form input
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // Fetch expense for editing
      const fetchExpense = async () => {
        try {
          setLoading(true);
          const expenses = await getExpenses({ userId: expense.userId, id });
          if (expenses.length > 0) {
            setExpense({
              ...expenses[0],
              amount: expenses[0].amount.toString(), // Convert float to string for form
            });
          } else {
            setError('Expense not found');
          }
        } catch (err) {
          setError('Failed to fetch expense');
        } finally {
          setLoading(false);
        }
      };
      fetchExpense();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense({ ...expense, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate and convert amount to float
    const amountFloat = parseFloat(expense.amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      setError('Amount must be a valid positive number');
      setLoading(false);
      return;
    }

    // Prepare payload with amount as float
    const payload = {
      ...expense,
      amount: amountFloat,
    };

    try {
      if (id) {
        await updateExpense(id, payload);
      } else {
        await addExpense(payload);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Expense' : 'Add Expense'}
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {loading && <CircularProgress sx={{ mb: 2 }} />}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Amount"
          name="amount"
          type="number"
        //   step="0.01" // Allow decimals
          value={expense.amount}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={loading}
          inputProps={{ min: 1.00 }}
        />
        <TextField
          label="Category"
          name="category"
          value={expense.category}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={loading}
          inputProps={{ maxLength: 50 }} // Match backend schema
        />
        <TextField
          label="Date"
          name="date"
          type="date"
          value={expense.date}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
          disabled={loading}
        />
        <TextField
          label="Description"
          name="description"
          value={expense.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          disabled={loading}
        />


        {/* <Button variant="contained">
        Add New Expense
        </Button> */}

        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {id ? 'Update' : 'Add'} Expense
        </Button>
      </form>
    </Box>
  );
}

export default ExpenseForm;