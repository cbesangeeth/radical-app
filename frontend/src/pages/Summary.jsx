import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getSummary } from "../utils/api/expenseApi";
import { getDateRangeForPeriod } from "../utils/dateUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Summary() {
  const [summaries, setSummaries] = useState([]); // Initialize as empty array
  const { startDate, endDate } = getDateRangeForPeriod("month");

  const [filters, setFilters] = useState({
    userId: 1, // Hardcoded for now
    period: "month",
    startDate: startDate,
    endDate: endDate,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef(null); // For debouncing API calls

  // Memoized fetch function
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSummary(
        filters.userId,
        filters.period,
        filters.startDate,
        filters.endDate
      );
      // Ensure data is an array; fallback to empty array if null/undefined
      setSummaries(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err); // Debug log
      setError(err.response?.data?.error || "Failed to fetch summary");
      setSummaries([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [filters.userId, filters.period, filters.startDate, filters.endDate]);

  // Effect to fetch summary with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      fetchSummary();
    }, 300); // 300ms debounce

    // Cleanup on unmount or filter change
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [fetchSummary]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "period") {

      const {startDate, endDate} = getDateRangeForPeriod(value);
     
      setFilters((prev) => ({
        ...prev,
        period: value,
        startDate: startDate,
        endDate: endDate,
      }));
    } else {
      // For other filter fields
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Only render chart if summaries is a non-empty array
  const chartData = {
    labels: summaries.length > 0 ? summaries.map((s) => s.period) : [],
    datasets: [
      {
        label: "Total Expenses",
        data: summaries.length > 0 ? summaries.map((s) => s.total) : [],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Expense Summary
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {loading && <CircularProgress sx={{ mb: 2 }} />}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <TextField
          select
          label="Period"
          name="period"
          value={filters.period}
          onChange={handleFilterChange}
          sx={{ minWidth: 120 }}
          disabled={loading}
        >
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="quarter">Quarter</MenuItem>
          <MenuItem value="year">Year</MenuItem>
        </TextField>
        <TextField
          label="Start Date"
          name="startDate"
          type="date"
          value={filters.startDate}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
          disabled={loading}
        />
        <TextField
          label="End Date"
          name="endDate"
          type="date"
          value={filters.endDate}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
          disabled={loading}
        />
        <Button variant="contained" onClick={fetchSummary} disabled={loading}>
          Refresh
        </Button>
      </Box>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        {summaries.length > 0 ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
          />
        ) : (
          <Typography>No data available for the selected filters.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default Summary;
