from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint('auth', __name__)

# In-memory user store (replace with database in production)
users = {}

@auth.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if username in users:
        return jsonify({'error': 'Username already exists'}), 409

    users[username] = generate_password_hash(password)
    return jsonify({'message': 'User registered successfully', 'username': username}), 200

@auth.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if username not in users or not check_password_hash(users[username], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({'message': 'Login successful', 'username': username}), 200
