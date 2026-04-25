import os
import pickle
import hashlib
import subprocess
from flask import Flask, request

app = Flask(__name__)

# CWE-798 — hardcoded credentials (gitleaks pattern, "SECRET" type).
# Expect ORS ~45–60 (HIGH severity, no CVE so no exploit telemetry).
AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"
GITHUB_TOKEN = "ghp_x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8"
DATABASE_URL = "postgresql://admin:hunter2@db.internal:5432/prod"


@app.route("/run")
def run_cmd():
    # CWE-78 — command injection via shell=True + user input.
    # Expect CRITICAL severity SAST. ORS ~60.
    cmd = request.args.get("cmd", "ls")
    return subprocess.check_output(cmd, shell=True)


@app.route("/user")
def get_user():
    # CWE-89 — SQL injection via string concatenation.
    # Expect CRITICAL severity SAST. ORS ~60.
    user_id = request.args.get("id")
    query = "SELECT * FROM users WHERE id = " + user_id
    return query


@app.route("/restore")
def restore_session():
    # CWE-502 — insecure deserialization. CRITICAL severity SAST.
    blob = request.get_data()
    session = pickle.loads(blob)
    return str(session)


def store_password(pw: str) -> str:
    # CWE-327 — weak crypto for passwords. HIGH severity.
    return hashlib.md5(pw.encode()).hexdigest()


@app.route("/file")
def read_file():
    # CWE-22 — path traversal. HIGH severity.
    name = request.args.get("name")
    with open("/var/data/" + name) as f:
        return f.read()


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)  # CWE-489 — debug enabled
