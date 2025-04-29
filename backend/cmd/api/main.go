package main

import (
	"cbesangeeth/internal/database"
	"cbesangeeth/internal/handlers"
	"cbesangeeth/internal/middleware"
	"context"
	"log"
	"os"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	//connect to database
	db := database.Connect()
	defer db.Close(context.Background())

	// inject handler
	r := gin.Default()

	// Configure CORS
	corsConfig := cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600, // Cache preflight response for 12 hours
	}

	r.Use(cors.New(corsConfig))

	// Initialize handlers
	expenseHandler := handlers.NewExpenseHandler(db)
	userHandler := handlers.NewUserHandler(db)

	// add endpoints
	r.POST("/oauth/google", userHandler.GoogleOauth)
	
	// Protected routes
	authGroup := r.Group("")
	authGroup.Use(middleware.AuthMiddleware())
	{
		authGroup.GET("/health", expenseHandler.HealthCheck)

		authGroup.GET("/expenses/summary", expenseHandler.GetSummary)
		authGroup.GET("/expenses", expenseHandler.ListExpenses)
		authGroup.POST("/expenses", expenseHandler.AddExpense)
		authGroup.PUT("/expenses/:id", expenseHandler.UpdateExpense)
		authGroup.DELETE("/expenses/:id", expenseHandler.DeleteExpense)

		authGroup.PUT("/users", userHandler.HandleUserUpdate)
		authGroup.GET("/users", userHandler.ListUsers)
	}

	r.Run(":" + os.Getenv("SERVER_PORT"))
}
