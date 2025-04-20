package main

import (
	"github.com/gin-contrib/cors"
	"cbesangeeth/internal/database"
	"cbesangeeth/internal/handlers"
	"context"
	"log"
	"os"

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
		AllowOrigins:     []string{"http://localhost:5173", "https://your-vercel-domain.vercel.app"}, // Add your Vercel domain
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600, // Cache preflight response for 12 hours
	}

	r.Use(cors.New(corsConfig))
	
	// Initialize handlers
	expenseHandler := handlers.NewExpenseHandler(db)

	// add endpoints
	r.POST("/expenses", expenseHandler.AddExpense)
	r.GET("/expenses", expenseHandler.ListExpenses)
	r.PUT("/expenses/:id", expenseHandler.UpdateExpense)
	r.DELETE("/expenses/:id", expenseHandler.DeleteExpense)
	r.GET("/expenses/summary", expenseHandler.GetSummary)
	r.GET("/health", expenseHandler.HealthCheck)

	r.Run(":" + os.Getenv("SERVER_PORT"))
}
