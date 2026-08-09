package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"audio-service/service"
)

func ProcessAudio(w http.ResponseWriter, r *http.Request) {
	file, header, err := r.FormFile("audio")
	if err != nil {
		fmt.Println(r.Body)
		fmt.Println("File error:", err)
		http.Error(w, "Failed to read file", 400)
		return
	}
	defer file.Close()

	// Save file locally
	filePath := filepath.Join("tmp", header.Filename)
	out, _ := os.Create(filePath)
	defer out.Close()
	io.Copy(out, file)

	// Step 1: Whisper
	fmt.Println("Saved file to:", filePath)
	text, err := service.Transcribe(filePath)
	if err != nil {
		fmt.Println("whisper error:", err)

		http.Error(w, "Whisper failed", 500)
		return
	}
	fmt.Println("Transcribed text:", text)

	// Step 2: Ollama
	jsonData, err := service.ParseToJSON(text)
	if err != nil {
		fmt.Println("LLM error:", err)
		http.Error(w, "LLM failed", 500)
		return
	}

	// Step 3: Send to Lambda
	err = service.SendToLambda(jsonData)
	if err != nil {
		fmt.Println("Lambda error:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(jsonData))
}
