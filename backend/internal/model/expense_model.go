package model

import "time"

// Expense represents the expense model
type Expense struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Amount      float64   `json:"amount"`
	Category    string    `json:"category"`
	Date        string    `json:"date"` // ISO 8601 format (e.g., "2025-04-18")
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
