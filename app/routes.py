
from flask import Blueprint, request, jsonify
from app.news import get_curated_news, get_search_news, expand_article
from .petrichor_agent import PetrichorAgent
from .quiz import determine_bias, store_user_bias, get_user_bias

main = Blueprint('main', __name__)
petrichor = PetrichorAgent()

@main.route('/api/news/curated', methods=['POST'])
def curated_news():
    data = request.get_json()
    filters = data.get('filters', [])
    page = int(data.get('page', 1))
    if not filters or len(filters) < 3:
        return jsonify([])
    try:
        articles = get_curated_news(filters, page)
        return jsonify(articles)
    except Exception as e:
        print(f"[ERROR] Curated news failed: {e}")
        return jsonify([]), 500

@main.route('/api/news/search', methods=['POST'])
def search_news():
    data = request.get_json()
    topic = data.get('topic', '').strip()
    page = int(data.get('page', 1))
    if not topic:
        return jsonify([])
    try:
        articles = get_search_news(topic, page)
        return jsonify(articles)
    except Exception as e:
        print(f"[ERROR] Search news failed: {e}")
        return jsonify([]), 500

@main.route('/api/news/expand', methods=['POST'])
def expand_news():
    content = request.json.get("content", "")
    if not content:
        return jsonify({"full": "No content to expand."}), 400
    try:
        full = expand_article(content)
        return jsonify({"full": full})
    except Exception as e:
        print(f"[ERROR] Expansion failed: {e}")
        return jsonify({"full": "Error expanding article"}), 500
