package main

import (
	"cbesangeeth/internal/database"
	"cbesangeeth/internal/server"
	"context"
	"log"
	"os"

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

	// Build router using shared factory so it can be reused for Lambda
	r := server.BuildRouter(db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // default port
	}
	r.Run(":" + port)
}
