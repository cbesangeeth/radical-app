
<!-- Local install  -->
```
cd backend
go mod tidy
```

<!-- Build -->
```
cd backend/cmd/lambda

GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -o bootstrap .
zip -r bootstrap.zip bootstrap
```

<!-- Deploy -->
Login into AWS Console
Goto AWS lambda
upload the zip file
Handler: main

Note: Make sure to set the env variables in AWS lambda
    DATABASE_URL
    JWT_SECRET