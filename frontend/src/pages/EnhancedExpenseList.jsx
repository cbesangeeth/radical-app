import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Collapse,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Search,
  FilterList,
  Edit,
  Delete,
  Add,
  TrendingUp,
  DateRange,
  Category,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { getDateRangeForPeriod } from '../utils/dateUtils';
import { getExpenses } from '../utils/api/expenseApi';

function EnhancedExpenseList() {
  // Sample data - replace with your actual data
//   const [expenses, setExpenses] = useState([
//     { id: 1, amount: 75.00, category: "grocery", date: "2025-08-01", description: "milk" },
//     { id: 2, amount: 199.00, category: "bill", date: "2025-08-01", description: "mom airtel recharge" },
//     { id: 3, amount: 50.00, category: "donation", date: "2025-08-01", description: "temple" },
//     { id: 4, amount: 850.00, category: "shopping", date: "2025-08-02", description: "brila putty" },
//     { id: 5, amount: 64.00, category: "grocery", date: "2025-08-02", description: "milk" },
//     { id: 6, amount: 255.00, category: "snacks", date: "2025-08-02", description: "sellakarachal visit" },
//     { id: 7, amount: 51352.00, category: "emi", date: "2025-08-02", description: "home loan" }
//   ]);
  
//   const [filters, setFilters] = useState({
//     startDate: "2025-08-01",
//     endDate: "2025-08-31",
//     category: "",
//     searchText: ""
//   });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, expenseId: null });

  const categories = [
    'All Categories',
    'Grocery', 
    'Food',
    'Transport', 
    'Entertainment',
    'Shopping',
    'Bills',
    'Healthcare',
    'Education',
    'EMI',
    'Donation',
    'Snacks',
    'Other'
  ];

  
//   const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const { startDate, endDate } = getDateRangeForPeriod("month");
  const [filters, setFilters] = useState({
    userId: 1, // Hardcoded for now
    startDate: startDate,
    endDate: endDate,
    category: "",
    searchText: "",
  });
  const debounceTimeout = useRef(null); // For debouncing API calls

  // Memoized fetch function
  const fetchExpenses = useCallback(async () => {
    try {
      const data = await getExpenses(filters);
      setExpenses(data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch expenses");
    }
  }, [filters]);

  // Effect to fetch expenses with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      fetchExpenses();
    }, 300); // 300ms debounce

    // Cleanup on unmount or filter change
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [fetchExpenses]);

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      grocery: 'success',
      food: 'warning',
      bill: 'error',
      shopping: 'secondary',
      transport: 'info',
      entertainment: 'primary',
      emi: 'default',
      donation: 'info',
      snacks: 'warning',
      healthcare: 'success',
      education: 'info',
      other: 'default'
    };
    return colors[category.toLowerCase()] || 'default';
  };

  // Filter expenses
  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      const matchesCategory = !filters.category || filters.category === 'All Categories' || 
        expense.category.toLowerCase().includes(filters.category.toLowerCase());
      const matchesSearch = !filters.searchText || 
        expense.description.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        expense.category.toLowerCase().includes(filters.searchText.toLowerCase());
      const matchesDateRange = expense.date >= filters.startDate && expense.date <= filters.endDate;
      
      return matchesCategory && matchesSearch && matchesDateRange;
    });
  };

  // Calculate summary stats
  const calculateStats = () => {
    const filteredExpenses = getFilteredExpenses();
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const count = filteredExpenses.length;
    const daysBetween = Math.max(1, Math.ceil((new Date(filters.endDate) - new Date(filters.startDate)) / (1000 * 60 * 60 * 24)) + 1);
    const avgPerDay = total / daysBetween;
    
    return { total, count, avgPerDay };
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({ open: true, expenseId: id });
  };

  const handleDeleteConfirm = async () => {
    try {
      setExpenses(expenses.filter(exp => exp.id !== deleteDialog.expenseId));
      console.log('Deleted expense:', deleteDialog.expenseId);
      setDeleteDialog({ open: false, expenseId: null });
    } catch (err) {
      setError("Failed to delete expense");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, expenseId: null });
  };

  const clearFilters = () => {
    setFilters({
      ...filters,
      category: "",
      searchText: ""
    });
  };

  const stats = calculateStats();
  const filteredExpenses = getFilteredExpenses();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" component="h1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Expenses
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained"
            color="success"
            startIcon={<Add />}
            onClick={() => console.log('Navigate to /add')}
            sx={{ fontWeight: 'medium' }}
          >
            Quick Add
          </Button>
          <Button 
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => console.log('Navigate to /bulk-add')}
            sx={{ fontWeight: 'medium' }}
          >
            Bulk Add
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="div" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                ₹{stats.total.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                Total Spent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <DateRange sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" component="div" sx={{ color: 'success.main', fontWeight: 'bold', mb: 1 }}>
                {stats.count}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                Total Expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Category sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" component="div" sx={{ color: 'warning.main', fontWeight: 'bold', mb: 1 }}>
                ₹{stats.avgPerDay.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                Avg per Day
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold' }}>
            Filters & Search
          </Typography>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            startIcon={showFilters ? <VisibilityOff /> : <Visibility />}
            sx={{ color: 'primary.main', fontWeight: 'medium' }}
          >
            {showFilters ? 'Hide' : 'Show'} Advanced
          </Button>
        </Box>
        
        {/* Quick Search - Always Visible */}
        <TextField
          fullWidth
          name="searchText"
          value={filters.searchText}
          onChange={handleFilterChange}
          placeholder="Search expenses by description or category..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat === 'All Categories' ? '' : cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{ height: '56px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Expenses Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ color: 'text.secondary' }}>
                      <Search sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h6">No expenses found matching your criteria</Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                        Try adjusting your filters or search terms
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((exp) => (
                  <TableRow 
                    key={exp.id}
                    hover
                    sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                  >
                    <TableCell>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        ₹{exp.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={exp.category}
                        color={getCategoryColor(exp.category)}
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(exp.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={exp.description}
                      >
                        {exp.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          onClick={() => console.log('Edit expense:', exp.id)}
                          color="primary"
                          size="small"
                          title="Edit expense"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClick(exp.id)}
                          color="error"
                          size="small"
                          title="Delete expense"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Table Footer with Summary */}
        {filteredExpenses.length > 0 && (
          <Box sx={{ 
            borderTop: 1, 
            borderColor: 'divider', 
            backgroundColor: 'primary.50',
            px: 3, 
            py: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </Typography>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Total: ₹{stats.total.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Quick Actions */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<Add />}
          onClick={() => console.log('Navigate to /add')}
          sx={{ px: 3, py: 1.5, fontWeight: 'medium' }}
        >
          Quick Add
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Add />}
          onClick={() => console.log('Navigate to /bulk-add')}
          sx={{ px: 3, py: 1.5, fontWeight: 'medium' }}
        >
          Bulk Add
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this expense? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Helper functions
//   function getCategoryColor(category) {
//     const colors = {
//       grocery: 'success',
//       food: 'warning',
//       bill: 'error',
//       shopping: 'secondary',
//       transport: 'info',
//       entertainment: 'primary',
//       emi: 'default',
//       donation: 'info',
//       snacks: 'warning',
//       healthcare: 'success',
//       education: 'info',
//       other: 'default'
//     };
//     return colors[category.toLowerCase()] || 'default';
//   }

//   function handleDeleteClick(id) {
//     setDeleteDialog({ open: true, expenseId: id });
//   }

//   function handleDeleteConfirm() {
//     try {
//       setExpenses(expenses.filter(exp => exp.id !== deleteDialog.expenseId));
//       console.log('Deleted expense:', deleteDialog.expenseId);
//       setDeleteDialog({ open: false, expenseId: null });
//     } catch (err) {
//       setError("Failed to delete expense");
//     }
//   }

//   function handleDeleteCancel() {
//     setDeleteDialog({ open: false, expenseId: null });
//   }
}

export default EnhancedExpenseList;