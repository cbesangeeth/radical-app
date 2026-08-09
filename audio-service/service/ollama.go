package service

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type OllamaResponse struct {
	Response string `json:"response"`
}

func ParseToJSON(text string) (string, error) {

	prompt := `
You are an API.

Convert the input into JSON array with:
- item (English)
- amount (number)
- category

Return ONLY JSON.

Input:
` + text

	body := map[string]interface{}{
		"model":  "llama3",
		"prompt": prompt,
		"stream": false,
	}

	jsonBody, _ := json.Marshal(body)

	resp, err := http.Post("http://localhost:11434/api/generate", "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)

	var result OllamaResponse
	json.Unmarshal(respBytes, &result)

	return result.Response, nil
}