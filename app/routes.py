
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

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    user_id = data.get('user_id')
    answers = data.get('answers', [])
    bias = determine_bias(answers)
    store_user_bias(user_id, bias)
    return jsonify({"bias": bias})

@app.route('/api/news/personalized', methods=['POST'])
def personalized_news():
    data = request.get_json()
    filters = data.get('filters', [])
    user_id = data.get('user_id')
    bias = get_user_bias(user_id)

    bias_prompt = {
        "left": "Rewrite this summary from a progressive or left-leaning tone.",
        "right": "Rewrite this summary from a conservative or right-leaning tone.",
        "center": "Keep the summary neutral and objective.",
        "unknown": ""
    }[bias]

    news = get_curated_news(filters)
    adjusted = []
    for article in news:
        try:
            response = petrichor.respond(f"{bias_prompt}\n\n{article['summary']}")
            adjusted.append({ "title": article["title"], "summary": response })
        except:
            adjusted.append(article)

    return jsonify(adjusted)
