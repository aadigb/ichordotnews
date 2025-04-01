from flask import Flask
from flask_cors import CORS
from app.routes import main
from app.auth import auth

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(auth)
    app.register_blueprint(main)
    return app
