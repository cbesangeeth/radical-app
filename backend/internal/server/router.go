package server

import (
	"cbesangeeth/internal/handlers"
	"cbesangeeth/internal/middleware"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// BuildRouter constructs and returns a configured *gin.Engine using the
// provided database connection. This lets both the local HTTP server and
// the AWS Lambda entrypoint reuse the same router configuration.
func BuildRouter(db *pgx.Conn) *gin.Engine {
	r := gin.Default()

	// Configure CORS
	// Read allowed origins from env `ALLOWED_ORIGINS` (comma separated).
	// If not set, default to * so browser requests from anywhere work.
	allowed := os.Getenv("ALLOWED_ORIGINS")
	if allowed == "" {
		allowed = "*"
	}
	origins := strings.Split(allowed, ",")

	corsConfig := cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}

	r.Use(cors.New(corsConfig))

	// Initialize handlers
	expenseHandler := handlers.NewExpenseHandler(db)
	userHandler := handlers.NewUserHandler(db)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	// Public endpoints
	r.POST("/oauth/google", userHandler.GoogleOauth)
	r.GET("/health", expenseHandler.HealthCheck)

	// Protected routes
	authGroup := r.Group("")
	authGroup.Use(middleware.AuthMiddleware())
	{
		// authGroup.GET("/health", expenseHandler.HealthCheck)

		authGroup.GET("/expenses/summary", expenseHandler.GetSummary)
		authGroup.GET("/expenses", expenseHandler.ListExpenses)
		authGroup.POST("/expenses", expenseHandler.AddExpense)
		authGroup.PUT("/expenses/:id", expenseHandler.UpdateExpense)
		authGroup.DELETE("/expenses/:id", expenseHandler.DeleteExpense)

		authGroup.PUT("/users", userHandler.HandleUserUpdate)
		authGroup.GET("/users", userHandler.ListUsers)
	}

	return r
}
