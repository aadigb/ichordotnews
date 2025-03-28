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
