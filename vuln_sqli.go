package main

  import (
        "database/sql"
        "fmt"
        "net/http"
  )

  func userHandler(db *sql.DB, w http.ResponseWriter, r *http.Request) {
        id := r.URL.Query().Get("id")
        q := fmt.Sprintf("SELECT * FROM users WHERE id = '%s'", id)
        rows, err := db.Query(q)
        if err != nil {
                http.Error(w, err.Error(), 500)
                return
        }
        defer rows.Close()
  }
