import os
import requests
import json
from datetime import datetime
from app.petrichor_agent import PetrichorAgent

NEWS_API_KEY = "c27ff28eb67248e4977c6d550cb6e371"
BASE_URL = "https://newsapi.org/v2/everything"
petrichor = PetrichorAgent()

PREF_PATH = os.path.join(os.path.dirname(__file__), "../user_preferences.json")
try:
    with open(PREF_PATH, "r") as f:
        USER_PREFS = json.load(f)
except Exception as e:
    print(f"[WARN] Could not load user preferences: {e}")
    USER_PREFS = {}

def save_user_preferences():
    try:
        with open(PREF_PATH, "w") as f:
            json.dump(USER_PREFS, f, indent=2)
    except Exception as e:
        print(f"[ERROR] Could not save preferences: {e}")

def get_user_style(username):
    prefs = USER_PREFS.get(username, {})
    quiz_style = prefs.get("quizResults", "")
    chat_style = prefs.get("chatStyle", "")
    style = f"Write in a style that reflects these preferences: {quiz_style}. {chat_style}".strip()
    return style if style else "Write clearly and informatively."

def summarize_article(title, description, username=None):
    style_prompt = get_user_style(username)
    prompt = f"""Format this into a social-media style post.
{style_prompt}

Only return:
TITLE
HOOK
SUMMARY

ARTICLE:
{title}
{description}
"""
    try:
        return petrichor.respond(prompt)
    except Exception as e:
        print(f"[ERROR] GPT summarization failed: {e}")
        return f"{title}\n\n{description}"

def expand_article(summary):
    try:
        return petrichor.respond(f"Expand this summary into a full readable news article:\n\n{summary}")
    except Exception as e:
        print(f"[ERROR] Expansion failed: {e}")
        return "Error expanding article."

def get_curated_news(filters, page=1, username=None):
    if not filters or len(filters) < 1:
        return []

    query = " OR ".join(filters)
    params = {
        "q": query,
        "pageSize": 20,
        "page": int(page),
        "sortBy": "publishedAt",
        "apiKey": NEWS_API_KEY,
        "language": "en",
    }

    try:
        res = requests.get(BASE_URL, params=params)
        res.raise_for_status()
        articles = res.json().get("articles", [])
    except Exception as e:
        print(f"[ERROR] News API error (curated): {e}")
        return []

    curated = []
    for article in articles:
        title = article.get("title", "")
        desc = article.get("description", "")
        urlToImage = article.get("urlToImage")
        if not title and not desc:
            continue
        summary = summarize_article(title, desc, username=username)
        curated.append({
            "title": title,
            "summary": summary,
            "thumbnail": urlToImage
        })

    return curated

def get_search_news(topic, page=1, username=None):
    params = {
        "qInTitle": topic,
        "pageSize": 10,
        "page": int(page),
        "sortBy": "relevancy",
        "apiKey": NEWS_API_KEY,
        "language": "en"
    }

    try:
        res = requests.get(BASE_URL, params=params)
        res.raise_for_status()
        articles = res.json().get("articles", [])
    except Exception as e:
        print(f"[ERROR] News API error (search): {e}")
        return []

    results = []
    for article in articles:
        title = article.get("title", "")
        desc = article.get("description", "")
        urlToImage = article.get("urlToImage")
        summary = summarize_article(title, desc, username=username)
        results.append({
            "title": title,
            "summary": summary,
            "thumbnail": urlToImage
        })

    return results
