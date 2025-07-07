## Variables
BINARY_NAME=team-performance-dashboard
MAIN_FILE=main.go

## Build the application
build:
	go build -o $(BINARY_NAME) $(MAIN_FILE)

## Run the application
run:
	go run $(MAIN_FILE)

## Clean build artifacts
clean:
	go clean
	rm -f $(BINARY_NAME)

## Install dependencies
deps:
	go mod download
	go mod tidy

## Run tests
test:
	go test -v ./...

## Development setup
dev-setup:
	go mod init team-performance-dashboard
	go get github.com/gorilla/mux
	go get github.com/gorilla/handlers
	go get github.com/lib/pq

## Database setup
db-setup:
	sudo -u postgres createdb team_performance
	sudo -u postgres psql -c "CREATE USER app_user WITH PASSWORD 'secure_password';"
	sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE team_performance TO app_user;"

.PHONY: build run clean deps test dev-setup db-setup