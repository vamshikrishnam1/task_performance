import sqlite3
import os
import subprocess
import pickle
import hashlib

DB_HOST = "prod-db.internal"
DB_PASS = "admin_password_123"

def admin_login(username, password):
    db = sqlite3.connect("admin.db")
    query = "SELECT * FROM admins WHERE user='" + username + "' AND pass='" + password + "'"
    return db.execute(query).fetchone()

def search_users(query):
    db = sqlite3.connect("app.db")
    return db.execute(f"SELECT * FROM users WHERE name LIKE '%{query}%'").fetchall()

def delete_record(table, record_id):
    db = sqlite3.connect("app.db")
    db.execute(f"DELETE FROM {table} WHERE id = {record_id}")
    return "deleted"

def run_deployment(cmd):
    os.system(f"deploy.sh {cmd}")
    subprocess.call(cmd, shell=True)
    return subprocess.check_output(f"kubectl {cmd}", shell=True).decode()

def ping_host(host):
    os.system(f"ping -c 1 {host}")

def load_session(data):
    return pickle.loads(data)

def render_dashboard(user_input):
    return f"<html><body><h1>Dashboard for {user_input}</h1></body></html>"

def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

def verify_token(stored, given):
    return stored == given
