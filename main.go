package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type WeeklyReport struct {
	ID        int                    `json:"id"`
	WeekOwner string                 `json:"weekOwner"`
	WeekStart string                 `json:"weekStart"`
	WeekEnd   string                 `json:"weekEnd"`
	TeamData  map[string]interface{} `json:"teamData"`
	CreatedAt time.Time              `json:"createdAt"`
}

type TeamMemberData struct {
	Assigned  int `json:"assigned"`
	Completed int `json:"completed"`
	Bugs      struct {
		Critical int `json:"critical"`
		Major    int `json:"major"`
		Minor    int `json:"minor"`
	} `json:"bugs"`
	TCR float64 `json:"tcr"`
	TPR float64 `json:"tpr"`
}

var db *sql.DB

func main() {
	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	var err error
	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Test database connection
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Create tables if they don't exist
	createTables()

	// Setup routes
	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/reports", getReports).Methods("GET")
	api.HandleFunc("/reports", createReport).Methods("POST")
	api.HandleFunc("/reports/{id}", getReport).Methods("GET")
	api.HandleFunc("/reports/{id}", deleteReport).Methods("DELETE")

	// Serve static files
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))

	// CORS middleware
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}

func createTables() {
	query := `
        CREATE TABLE IF NOT EXISTS weekly_reports (
                id SERIAL PRIMARY KEY,
                week_owner VARCHAR(255) NOT NULL,
                week_start DATE NOT NULL,
                week_end DATE NOT NULL,
                team_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `

	if _, err := db.Exec(query); err != nil {
		log.Fatal("Failed to create tables:", err)
	}
}

func getReports(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
                SELECT id, week_owner, week_start, week_end, team_data, created_at 
                FROM weekly_reports 
                ORDER BY created_at DESC
        `)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var reports []WeeklyReport
	for rows.Next() {
		var report WeeklyReport
		var teamDataJSON []byte

		err := rows.Scan(
			&report.ID,
			&report.WeekOwner,
			&report.WeekStart,
			&report.WeekEnd,
			&teamDataJSON,
			&report.CreatedAt,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := json.Unmarshal(teamDataJSON, &report.TeamData); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		reports = append(reports, report)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reports)
}

func createReport(w http.ResponseWriter, r *http.Request) {
	var report WeeklyReport
	if err := json.NewDecoder(r.Body).Decode(&report); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	teamDataJSON, err := json.Marshal(report.TeamData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	query := `
                INSERT INTO weekly_reports (week_owner, week_start, week_end, team_data)
                VALUES ($1, $2, $3, $4)
                RETURNING id, created_at
        `

	err = db.QueryRow(
		query,
		report.WeekOwner,
		report.WeekStart,
		report.WeekEnd,
		teamDataJSON,
	).Scan(&report.ID, &report.CreatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(report)
}

func getReport(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid report ID", http.StatusBadRequest)
		return
	}

	var report WeeklyReport
	var teamDataJSON []byte

	query := `
                SELECT id, week_owner, week_start, week_end, team_data, created_at 
                FROM weekly_reports 
                WHERE id = $1
        `

	err = db.QueryRow(query, id).Scan(
		&report.ID,
		&report.WeekOwner,
		&report.WeekStart,
		&report.WeekEnd,
		&teamDataJSON,
		&report.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Report not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.Unmarshal(teamDataJSON, &report.TeamData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(report)
}

func deleteReport(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid report ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM weekly_reports WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Report not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Report deleted successfully"})
}
