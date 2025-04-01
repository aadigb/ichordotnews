from flask import Blueprint, request, jsonify
from app.news import get_curated_news as fetch_curated_news, get_search_news as fetch_search_news, expand_article
from app.quiz import get_user_bias, save_user_preferences, USER_PREFS
from app.petrichor_agent import PetrichorAgent

main = Blueprint('main', __name__)
petrichor = PetrichorAgent()

@main.route('/api/news/curated', methods=['POST'])
def curated_news_route():
    data = request.get_json()
    filters = data.get('filters', [])
    page = data.get('page', 1)
    username = data.get('username', 'guest')
    news = fetch_curated_news(filters, page, username)
    return jsonify(news)

@main.route('/api/news/search', methods=['POST'])
def search_news_route():
    data = request.get_json()
    topic = data.get('topic', '')
    page = data.get('page', 1)
    username = data.get('username', 'guest')
    news = fetch_search_news(topic, page, username)
    return jsonify(news)

@main.route('/api/news/expand', methods=['POST'])
def expand_news_article():
    data = request.get_json()
    content = data.get('content', '')
    result = expand_article(content)
    return jsonify({ 'full': result })

@main.route('/api/petrichor/chat', methods=['POST'])
def petrichor_chat():
    data = request.json
    prompt = data.get("prompt", "")
    username = data.get("username", "guest")

    try:
        response = petrichor.respond(prompt, username=username)
        return jsonify({"response": response})
    except Exception as e:
        print(f"[ERROR] Chat error: {e}")
        return jsonify({"error": "Something went wrong"}), 500

@main.route('/api/quiz/submit', methods=['POST'])
def quiz_submit():
    data = request.json
    answers = data.get("answers", [])
    username = data.get("username", "guest")

    if not answers or len(answers) != 5:
        return jsonify({"error": "Incomplete answers"}), 400

    bias = evaluate_bias(answers)
    USER_PREFS[username] = USER_PREFS.get(username, {})
    USER_PREFS[username]["quizResults"] = bias

    save_user_preferences()

    return jsonify({"bias": bias})
