import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { getExpenses, deleteExpense } from "../utils/api";

function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    userId: 1, // Hardcoded for now
    startDate: "",
    endDate: "",
    category: "",
  });
  const [error, setError] = useState("");
  const debounceTimeout = useRef(null); // For debouncing API calls

  // Memoized fetch function
  const fetchExpenses = useCallback(async () => {
    console.log("Fetching expenses with filters:", filters); // Debug log
    try {
      const data = await getExpenses(filters);
      setExpenses(data);
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        fetchExpenses();
      } catch (err) {
        setError("Failed to delete expense");
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Expenses
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <TextField
          label="Start Date"
          name="startDate"
          type="date"
          value={filters.startDate}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          name="endDate"
          type="date"
          value={filters.endDate}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Category"
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
        />
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((exp) => (
            <TableRow key={exp.id}>
              <TableCell>₹{exp.amount.toFixed(2)}</TableCell>
              <TableCell>{exp.category}</TableCell>
              <TableCell>{exp.date}</TableCell>
              <TableCell>{exp.description}</TableCell>
              <TableCell>
                <IconButton onClick={() => navigate(`/edit/${exp.id}`)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(exp.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default ExpenseList;
