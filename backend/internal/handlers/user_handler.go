package handlers

import (
	"cbesangeeth/internal/model"
	"context"
	"fmt"
	"net/http"
	"os"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"google.golang.org/api/idtoken"
)

// UserHandler handles expense-related HTTP requests
type UserHandler struct {
	DB *pgx.Conn
}

// NewUserHandler creates a new ExpenseHandler
func NewUserHandler(db *pgx.Conn) *UserHandler {
	return &UserHandler{DB: db}
}

func generateJWT(userID int, email string) (string, error) {
	secret := []byte(os.Getenv("JWT_SECRET"))

	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"exp":     time.Now().Add(time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

func (h *UserHandler) GoogleOauth(c *gin.Context) {

	var req model.GoogleOauthReq

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing credential"})
		return
	}

	payload, err := idtoken.Validate(context.Background(), req.Credential, "965708989841-c3ghgrpu83jg336emaqs8ouooovr4a8d.apps.googleusercontent.com")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid ID token"})
		return
	}

	email := payload.Claims["email"].(string)
	name := payload.Claims["name"].(string)
	sub := payload.Claims["sub"].(string) // This is Google user ID

	user := model.UserCreateRequest{
		ID:    sub,
		Email: email,
		Name:  name,
	}

	// Check if user exists by google_id
	var userID int
	err = h.DB.QueryRow(context.Background(),
		`SELECT id FROM users WHERE google_id = $1`, user.ID).
		Scan(&userID)

	if err != nil && err != pgx.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check user"})
		return
	}

	err = h.DB.QueryRow(context.Background(),
		`INSERT INTO users (google_id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT ON CONSTRAINT users_google_id_key DO UPDATE
     SET name = EXCLUDED.name, updated_at = NOW()
     RETURNING id`,
		user.ID, user.Email, user.Name).
		Scan(&userID)

	if err != nil {
		// Handle conflict on email (if the conflict was not on google_id)
		// Try update by email
		err = h.DB.QueryRow(context.Background(),
			`UPDATE users
         SET name = $1, updated_at = NOW()
         WHERE email = $2
         RETURNING id`,
			user.Name, user.Email).
			Scan(&userID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert or update user"})
			return
		}
	}

	// generate jwt token
	token, err := generateJWT(userID, email)

	c.JSON(http.StatusOK, gin.H{
		"userId": userID,
		"token":  token,
	})

}

func (h *UserHandler) ListUsers(c *gin.Context) {

	query := `SELECT * FROM users`

	rows, err := h.DB.Query(context.Background(), query)
	if err != nil {
		fmt.Println(err)

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	defer rows.Close()

	var users []model.User
	for rows.Next() {
		var exp model.User
		err := rows.Scan(&exp.ID, &exp.Name, &exp.CreatedAt, &exp.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan users"})
			return
		}

		users = append(users, exp)
	}

}

func (h *UserHandler) HandleUserUpdate(c *gin.Context) {
	var user model.UserCreateRequest

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Check if user exists
	var existingUserID int
	err := h.DB.QueryRow(context.Background(),
		`SELECT id FROM users WHERE google_id = $1`, user.ID).
		Scan(&existingUserID)

	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query user"})
		return
	}

	// Perform the update
	_, err = h.DB.Exec(context.Background(),
		`UPDATE users
         SET email = $1, name = $2, updated_at = NOW()
         WHERE google_id = $3`,
		user.Email, user.Name, user.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}
