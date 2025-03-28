import os
import requests
from datetime import datetime, timedelta
from app.petrichor_agent import PetrichorAgent

NEWS_API_KEY = "c27ff28eb67248e4977c6d550cb6e371"
BASE_URL = "https://newsapi.org/v2/everything"
petrichor = PetrichorAgent()


def summarize_article(title, description):
    prompt = f"""Format this into a social-media style post.
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


def get_curated_news(filters, page=1):
    if not filters or len(filters) < 3:
        return []

    query = " OR ".join(filters)
    params = {
        "q": query,
        "pageSize": 5,
        "page": int(page),
        "sortBy": "relevancy",
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
        title = article.get("title") or article.get("source", {}).get("name", "Untitled")
        desc = article.get("description") or article.get("content") or ""

        if not title and not desc:
            continue

        summary = summarize_article(title, desc)
        curated.append({
            "title": title,
            "summary": summary
        })

    return curated


def get_search_news(topic, page=1):
    params = {
        "q": topic,
        "pageSize": 5,
        "page": int(page),
        "sortBy": "relevancy",  # Or "publishedAt" if you want recent
        "apiKey": NEWS_API_KEY,
        "language": "en"
    }

    try:
        res = requests.get(BASE_URL, params=params)
        res.raise_for_status()
        data = res.json()
        articles = data.get("articles", [])

        if not articles:
            print(f"[INFO] No search results for '{topic}'")
            print(f"[DEBUG] Full API response: {data}")

    except Exception as e:
        print(f"[ERROR] News API error (search): {e}")
        return []

    results = []
    for article in articles:
        title = article.get("title", "")
        desc = article.get("description", "")
        summary = summarize_article(title, desc)
        results.append({
            "title": title,
            "summary": summary
        })

    return results


