package main

import (
	"cbesangeeth/internal/database"
	"cbesangeeth/internal/server"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var httpServer *http.Server

func init() {
	db := database.Connect()
	if db == nil {
		log.Fatalf("DB connection failed")
	}

	router := server.BuildRouter(db)

	httpServer = &http.Server{
		Handler: router,
	}
}

// Handler converts LambdaFunctionURLRequest to an HTTP request,
// routes it through Gin, and converts the response back.
func Handler(ctx context.Context, request events.LambdaFunctionURLRequest) (events.LambdaFunctionURLResponse, error) {
	// Reconstruct the full URL
	scheme := "https"
	if val, ok := request.Headers["x-forwarded-proto"]; ok {
		scheme = val
	}

	host := request.RequestContext.DomainName
	if val, ok := request.Headers["host"]; ok {
		host = val
	}

	// Build full path with query string
	path := request.RawPath
	if request.RawQueryString != "" {
		path = path + "?" + request.RawQueryString
	}

	url := fmt.Sprintf("%s://%s%s", scheme, host, path)

	// Create HTTP request
	httpReq, err := http.NewRequestWithContext(ctx, request.RequestContext.HTTP.Method, url, nil)
	if err != nil {
		return events.LambdaFunctionURLResponse{StatusCode: 500}, err
	}

	// Set body if present
	if request.Body != "" {
		body := request.Body
		if request.IsBase64Encoded {
			// Decode base64 if needed
			body = request.Body
		}
		httpReq.Body = io.NopCloser(strings.NewReader(body))
	}

	// Copy headers from Lambda event to HTTP request
	for key, value := range request.Headers {
		httpReq.Header.Set(key, value)
	}

	// Use httptest.ResponseRecorder to capture the response
	// This is the standard Go way and ensures all headers are properly captured
	recorder := httptest.NewRecorder()

	// Serve the request through Gin
	httpServer.Handler.ServeHTTP(recorder, httpReq)

	// Extract headers from recorder
	responseHeaders := make(map[string]string)
	for key, values := range recorder.Header() {
		if len(values) > 0 {
			responseHeaders[key] = values[0]
		}
	}

	// Build Lambda Function URL response
	response := events.LambdaFunctionURLResponse{
		StatusCode: recorder.Code,
		Headers:    responseHeaders,
		Body:       recorder.Body.String(),
	}

	return response, nil
}

func main() {
	lambda.Start(Handler)
}
