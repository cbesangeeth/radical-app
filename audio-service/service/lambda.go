package service

import (
	"bytes"
	"net/http"
)

func SendToLambda(jsonData string) error {
	_, err := http.Post(
		"https://your-api.execute-api.aws.com/expenses",
		"application/json",
		bytes.NewBuffer([]byte(jsonData)),
	)

	return err
}