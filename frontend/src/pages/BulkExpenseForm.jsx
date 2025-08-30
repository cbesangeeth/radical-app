import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  FormControlLabel,
  Checkbox,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { addExpense } from '../utils/api/expenseApi';

function BulkExpenseForm() {
  const [commonDate, setCommonDate] = useState(new Date().toISOString().split('T')[0]);
  const [sameCategory, setSameCategory] = useState(false);
  const [commonCategory, setCommonCategory] = useState('');
  const [expenses, setExpenses] = useState([
    { amount: '', category: '', description: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Food',
    'Transport', 
    'Entertainment',
    'Shopping',
    'Bills',
    'Utility',
    'Travel',
    'Grocery',
    'Rent',
    'Snacks',
    'Salary',
    'Investment',
    'Gift',
    'Personal Care',
    'Insurance',
    'Healthcare',
    'Education',
    'Other'
  ];

  const addExpenseRow = () => {
    setExpenses([...expenses, { 
      amount: '', 
      category: sameCategory ? commonCategory : '', 
      description: '' 
    }]);
  };

  const removeExpenseRow = (index) => {
    if (expenses.length > 1) {
      const newExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(newExpenses);
    }
  };

  const updateExpense = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    setExpenses(newExpenses);
  };

  const handleSameCategoryChange = (checked) => {
    setSameCategory(checked);
    if (checked && commonCategory) {
      const newExpenses = expenses.map(exp => ({
        ...exp,
        category: commonCategory
      }));
      setExpenses(newExpenses);
    }
  };

  const handleCommonCategoryChange = (value) => {
    setCommonCategory(value);
    if (sameCategory) {
      const newExpenses = expenses.map(exp => ({
        ...exp,
        category: value
      }));
      setExpenses(newExpenses);
    }
  };

  const calculateTotal = () => {
    return expenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return total + amount;
    }, 0);
  };

  const validateExpenses = () => {
    const validExpenses = expenses.filter(exp => 
      exp.amount && 
      parseFloat(exp.amount) > 0 && 
      exp.category
    );
    
    if (validExpenses.length === 0) {
      setError('Please add at least one complete expense (amount and category required)');
      return false;
    }
    
    setError('');
    return validExpenses;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validExpenses = validateExpenses();
    if (!validExpenses) return;

    setLoading(true);

    try {
      // Prepare expenses for API
      const expensesToSave = validExpenses.map(expense => ({
        userId: 1, // Hardcoded for 1-2 users
        amount: parseFloat(expense.amount),
        category: expense.category,
        date: commonDate,
        description: expense.description || ''
      }));

      for (const expense of expensesToSave) {
        await addExpense(expense);
      }
      
      console.log('Expenses to save:', expensesToSave);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`${expensesToSave.length} expenses saved successfully!`);
      
      // Reset form
      setExpenses([
        { amount: '', category: '', description: '' },
      ]);
      setSameCategory(false);
      setCommonCategory('');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save expenses');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setExpenses([
      { amount: '', category: '', description: '' },
    ]);
    setSameCategory(false);
    setCommonCategory('');
    setError('');
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>
        Bulk Add Expenses
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Common Settings */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: '#333' }}>
          Common Settings
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          alignItems: 'center', 
          flexWrap: 'wrap',
          mt: 2
        }}>
          <TextField
            label="Date for all expenses"
            type="date"
            value={commonDate}
            onChange={(e) => setCommonDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            disabled={loading}
            size="small"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={sameCategory}
                onChange={(e) => handleSameCategoryChange(e.target.checked)}
                disabled={loading}
              />
            }
            label="Use same category for all"
          />
          
          {sameCategory && (
            <TextField
              select
              label="Common Category"
              value={commonCategory}
              onChange={(e) => handleCommonCategoryChange(e.target.value)}
              sx={{ minWidth: 180 }}
              disabled={loading}
              size="small"
            >
              <MenuItem value="">Select Category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          )}
        </Box>
      </Paper>

      {/* Expense Rows */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          bgcolor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Expenses ({expenses.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addExpenseRow}
            disabled={loading}
            sx={{ 
              bgcolor: '#4caf50', 
              '&:hover': { bgcolor: '#45a049' },
              fontWeight: 500
            }}
          >
            Add Row
          </Button>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {expenses.map((expense, index) => (
            <Paper 
              key={index} 
              variant="outlined" 
              sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: '#fafafa',
                '&:hover': { 
                  bgcolor: '#ffffff', 
                  borderColor: '#1976d2',
                  boxShadow: 1
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  sm: '1fr 1fr', 
                  md: '1fr 1fr 2fr auto' 
                },
                gap: 2,
                alignItems: 'start'
              }}>
                <TextField
                  label="Amount"
                  type="number"
                  inputProps={{ step: "0.01", min: "0.01" }}
                  value={expense.amount}
                  onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                  required
                  disabled={loading}
                  size="small"
                  placeholder="0.00"
                  fullWidth
                />
                
                <TextField
                  select
                  label="Category"
                  value={sameCategory ? commonCategory : expense.category}
                  onChange={(e) => updateExpense(index, 'category', e.target.value)}
                  required
                  disabled={loading || sameCategory}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  label="Description"
                  value={expense.description}
                  onChange={(e) => updateExpense(index, 'description', e.target.value)}
                  disabled={loading}
                  size="small"
                  placeholder="Optional description..."
                  multiline
                  rows={2}
                  fullWidth
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                  <IconButton
                    onClick={() => removeExpenseRow(index)}
                    disabled={expenses.length === 1 || loading}
                    sx={{ 
                      color: expenses.length === 1 ? '#ccc' : '#f44336',
                      '&:hover': { 
                        bgcolor: expenses.length === 1 ? 'transparent' : '#ffebee' 
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
        
        {/* Total Summary */}
        <Divider />
        <Box sx={{ 
          p: 3, 
          bgcolor: '#e3f2fd', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Total Amount:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
            ₹{calculateTotal().toFixed(2)}
          </Typography>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={clearAll}
          disabled={loading}
          sx={{ minWidth: 120, fontWeight: 500 }}
        >
          Clear All
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ 
            minWidth: 180, 
            bgcolor: '#1976d2',
            fontWeight: 500,
            '&:hover': { bgcolor: '#1565c0' }
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Saving...
            </Box>
          ) : (
            `Add ${expenses.filter(exp => exp.amount && exp.category).length} Expenses`
          )}
        </Button>
      </Box>
    </Box>
  );
}

export default BulkExpenseForm;