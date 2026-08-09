package main

import (
	"log"
	"net/http"

	"audio-service/handler"
)

func main() {
	http.HandleFunc("/process-audio", handler.ProcessAudio)

	log.Println("Server running on :8080")
	http.ListenAndServe(":8080", nil)
}