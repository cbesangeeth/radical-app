package handlers

import (
	"cbesangeeth/internal/model"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// ExpenseHandler handles expense-related HTTP requests
type ExpenseHandler struct {
	DB *pgx.Conn
}

// NewExpenseHandler creates a new ExpenseHandler
func NewExpenseHandler(db *pgx.Conn) *ExpenseHandler {
	return &ExpenseHandler{DB: db}
}

// AddExpense handles POST /expenses
func (h *ExpenseHandler) AddExpense(c *gin.Context) {
	var req struct {
		UserID      int     `json:"userId" binding:"required"`
		Amount      float64 `json:"amount" binding:"required,gt=0"`
		Category    string  `json:"category" binding:"required,max=50"`
		Date        string  `json:"date" binding:"required"`
		Description string  `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse and validate date
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
		return
	}

	// Insert expense
	var id int
	err = h.DB.QueryRow(context.Background(),
		`INSERT INTO expenses (user_id, amount, category, date, description, updated_at)
		 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id`,
		req.UserID, req.Amount, req.Category, date, req.Description).Scan(&id)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add expense"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Expense added",
		"id":      id,
	})
}

// ListExpenses handles GET /expenses
func (h *ExpenseHandler) ListExpenses(c *gin.Context) {
	userID := c.Query("userId")
	startDate := c.Query("startDate") // YYYY-MM-DD
	endDate := c.Query("endDate")     // YYYY-MM-DD
	category := c.Query("category")
	id := c.Query("id")

	query := `SELECT id, user_id, amount, category, date, description, created_at, updated_at
	          FROM expenses WHERE user_id = $1`
	args := []interface{}{userID}
	argIndex := 2

	if id != "" {
		query += fmt.Sprintf(" AND id = $%d", argIndex)
		args = append(args, id)
		argIndex++
	}

	if startDate != "" {
		query += fmt.Sprintf(" AND date >= $%d", argIndex)
		args = append(args, startDate)
		argIndex++
	}

	if endDate != "" {
		query += fmt.Sprintf(" AND date <= $%d", argIndex)
		args = append(args, endDate)
		argIndex++
	}

	if category != "" {
		query += fmt.Sprintf(" AND category = $%d", argIndex)
		args = append(args, category)
		argIndex++
	}
	
	fmt.Println(query)
	fmt.Println(args)
	rows, err := h.DB.Query(context.Background(), query, args...)
	if err != nil {
		fmt.Println(err)

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch expenses"})
		return
	}
	defer rows.Close()

	var expenses []model.Expense
	for rows.Next() {
		var exp model.Expense
		var date time.Time
		err := rows.Scan(&exp.ID, &exp.UserID, &exp.Amount, &exp.Category, &date, &exp.Description, &exp.CreatedAt, &exp.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan expenses"})
			return
		}
		exp.Date = date.Format("2006-01-02")
		expenses = append(expenses, exp)
	}

	c.JSON(http.StatusOK, gin.H{"expenses": expenses})
}

// UpdateExpense handles PUT /expenses/:id
func (h *ExpenseHandler) UpdateExpense(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		UserID      int     `json:"user_id" binding:"required"`
		Amount      float64 `json:"amount" binding:"required,gt=0"`
		Category    string  `json:"category" binding:"required,max=50"`
		Date        string  `json:"date" binding:"required"`
		Description string  `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse and validate date
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
		return
	}

	// Update expense
	result, err := h.DB.Exec(context.Background(),
		`UPDATE expenses SET user_id = $1, amount = $2, category = $3, date = $4, description = $5, updated_at = CURRENT_TIMESTAMP
		 WHERE id = $6`,
		req.UserID, req.Amount, req.Category, date, req.Description, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update expense"})
		return
	}
	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Expense not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Expense updated"})
}

// DeleteExpense handles DELETE /expenses/:id
func (h *ExpenseHandler) DeleteExpense(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec(context.Background(), `DELETE FROM expenses WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete expense"})
		return
	}
	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Expense not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Expense deleted"})
}

// GetSummary handles GET /expenses/summary
func (h *ExpenseHandler) GetSummary(c *gin.Context) {
	userID := c.Query("userId")
	period := c.Query("period")        // day, month, quarter, year
	startDate := c.Query("startDate") // YYYY-MM-DD
	endDate := c.Query("endDate")     // YYYY-MM-DD

	if period == "" {
		period = "month" // Default to monthly summary
	}

	var query string
	args := []interface{}{userID}
	switch period {
	case "day":
		query = `SELECT date, SUM(amount) AS total
		         FROM expenses
		         WHERE user_id = $1 AND date BETWEEN $2 AND $3
		         GROUP BY date
		         ORDER BY date`
		args = append(args, startDate, endDate)
	case "month":
		query = `SELECT date_trunc('month', date) AS period, SUM(amount) AS total
		         FROM expenses
		         WHERE user_id = $1 AND date BETWEEN $2 AND $3
		         GROUP BY date_trunc('month', date)
		         ORDER BY period`
		args = append(args, startDate, endDate)
	case "quarter":
		query = `SELECT date_trunc('quarter', date) AS period, SUM(amount) AS total
		         FROM expenses
		         WHERE user_id = $1 AND date BETWEEN $2 AND $3
		         GROUP BY date_trunc('quarter', date)
		         ORDER BY period`
		args = append(args, startDate, endDate)
	case "year":
		query = `SELECT date_trunc('year', date) AS period, SUM(amount) AS total
		         FROM expenses
		         WHERE user_id = $1 AND date BETWEEN $2 AND $3
		         GROUP BY date_trunc('year', date)
		         ORDER BY period`
		args = append(args, startDate, endDate)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid period, use day, month, quarter, or year"})
		return
	}

	rows, err := h.DB.Query(context.Background(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch summary"})
		return
	}
	defer rows.Close()

	var summaries []map[string]interface{}
	for rows.Next() {
		var period time.Time
		var total float64
		err := rows.Scan(&period, &total)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan summary"})
			return
		}
		summaries = append(summaries, map[string]interface{}{
			"period": period.Format("2006-01-02"),
			"total":  total,
		})
	}

	c.JSON(http.StatusOK, gin.H{"summaries": summaries})
}

func (h *ExpenseHandler) HealthCheck(c *gin.Context) {
	err := h.DB.Ping(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "Database connected"})
}

