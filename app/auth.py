import os
import json
from flask import Blueprint, request, jsonify

auth = Blueprint('auth', __name__)
USER_FILE = 'users.json'

# Create the users file if it doesn't exist
if not os.path.exists(USER_FILE):
    with open(USER_FILE, 'w') as f:
        json.dump({}, f)

def load_users():
    with open(USER_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USER_FILE, 'w') as f:
        json.dump(users, f)

@auth.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    users = load_users()
    if username in users:
        return jsonify({'error': 'Username already exists'}), 409

    users[username] = password
    save_users(users)
    return jsonify({'username': username})

@auth.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    users = load_users()
    if username in users and users[username] == password:
        return jsonify({'username': username})
    return jsonify({'error': 'Invalid credentials'}), 401
