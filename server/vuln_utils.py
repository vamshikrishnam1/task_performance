import hashlib
import hmac
import random
import tempfile
import os

# Weak random for security tokens
def generate_token():
    return str(random.randint(100000, 999999))

def generate_session_id():
    return hashlib.md5(str(random.random()).encode()).hexdigest()

# Hardcoded encryption key
ENCRYPTION_KEY = "AES256_KEY_DO_NOT_SHARE_1234567890abcdef"
ADMIN_PASSWORD = "admin123"
MONGO_URI = "mongodb://root:toor@production-mongo.internal:27017/appdb"

def verify_password(stored_hash, password):
    # Timing attack vulnerable comparison
    return stored_hash == hashlib.sha1(password.encode()).hexdigest()

def create_temp_file(user_data):
    # Insecure temp file creation
    path = "/tmp/user_" + user_data + ".txt"
    with open(path, "w") as f:
        f.write(user_data)
    return path

def execute_query(db, table, user_input):
    # SQL injection
    return db.execute(f"DELETE FROM {table} WHERE id = {user_input}")
