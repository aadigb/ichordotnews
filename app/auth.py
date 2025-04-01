from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint('auth', __name__)
users = {}  # In-memory DB (replace with real DB later)

@auth.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    if username in users:
        return jsonify({"error": "Username already exists"}), 400

    users[username] = generate_password_hash(password)
    return jsonify({"message": "User registered successfully!"}), 201

@auth.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username not in users or not check_password_hash(users[username], password):
        return jsonify({"error": "Invalid username or password"}), 401

    session['user'] = username
    return jsonify({"message": "Login successful", "username": username})

@auth.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"message": "Logged out successfully"})

@auth.route('/api/user', methods=['GET'])
def get_user():
    user = session.get('user')
    if not user:
        return jsonify({"user": None}), 401
    return jsonify({"user": user})
