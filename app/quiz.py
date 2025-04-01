import json
import os
user_bias_store = {}

def determine_bias(answers):
    score = sum(answers)
    if score < -3:
        return "left"
    elif score > 3:
        return "right"
    else:
        return "center"

def store_user_bias(user_id, bias):
    if user_id:
        user_bias_store[user_id] = bias

def get_user_bias(user_id):
    return user_bias_store.get(user_id, "unknown")


PREF_PATH = os.path.join(os.path.dirname(__file__), "../user_preferences.json")

def save_user_preferences():
    try:
        with open(PREF_PATH, "w") as f:
            json.dump(USER_PREFS, f, indent=2)
        print("[INFO] Saved user preferences.")
    except Exception as e:
        print(f"[ERROR] Could not save preferences: {e}")
