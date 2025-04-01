from flask import Blueprint, request, jsonify
from app.news import get_curated_news, get_search_news, expand_article
from app.quiz import get_user_bias

main = Blueprint('main', __name__)

@main.route('/api/news/curated', methods=['POST'])
def get_curated_news():
    data = request.get_json()
    filters = data.get('filters', [])
    page = data.get('page', 1)
    news = fetch_curated_news(filters, page)
    return jsonify(news)

@main.route('/api/news/search', methods=['POST'])
def get_search_news():
    data = request.get_json()
    topic = data.get('topic', '')
    page = data.get('page', 1)
    news = fetch_search_news(topic, page)
    return jsonify(news)

@main.route('/api/news/expand', methods=['POST'])
def expand_news_article():
    data = request.get_json()
    content = data.get('content', '')
    result = expand_article(content)
    return jsonify({ 'full': result })

@main.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    result = handle_quiz_submission(data)
    return jsonify(result)
