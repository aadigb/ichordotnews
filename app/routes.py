from flask import Blueprint, request, jsonify
from app.news import (
    get_curated_news,
    get_search_news,

)
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
        return jsonify({"full": "No content provided."})
    
    try:
        full = petrichor.respond(f"Expand this article into a fully readable AI-generated post:\n\n{content}")
        return jsonify({"full": full})
    except Exception as e:
        print(f"[ERROR] Expansion failed: {e}")
        return jsonify({"full": content})





@main.route('/api/quiz', methods=['POST'])
def quiz():
    answers = request.json.get('answers', [])
    user_id = request.json.get('user_id', '')

    if not isinstance(answers, list) or not user_id:
        return jsonify({'error': 'Invalid quiz submission'}), 400

    try:
        result = determine_bias([int(a) for a in answers])
        store_user_bias(user_id, result)
        return jsonify({'bias': result})
    except Exception as e:
        print(f"[ERROR] Quiz failed: {e}")
        return jsonify({'error': 'Could not process quiz'}), 500


@main.route('/api/user/bias/<user_id>', methods=['GET'])
def get_bias(user_id):
    try:
        bias = get_user_bias(user_id)
        return jsonify({'bias': bias})
    except Exception as e:
        print(f"[ERROR] Failed to fetch bias: {e}")
        return jsonify({'bias': 'unknown'}), 500


@main.route('/api/petrichor/chat', methods=['POST'])
def petrichor_chat():
    prompt = request.json.get('prompt', '')
    if not prompt:
        return jsonify({'response': 'No prompt provided'}), 400

    try:
        response = petrichor.respond(prompt)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'response': f"Error: {str(e)}"}), 500


@main.route('/api/petrichor/bias-explainer', methods=['POST'])
def explain_bias():
    content = request.json.get('content', '')
    if not content:
        return jsonify({'explanation': 'No content provided'}), 400

    try:
        prompt = f"Explain the political bias in this content:\n\n{content}"
        explanation = petrichor.respond(prompt)
        return jsonify({'explanation': explanation})
    except Exception as e:
        print(f"[ERROR] Bias explainer failed: {e}")
        return jsonify({'explanation': 'Error generating explanation'}), 500
