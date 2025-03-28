from app.petrichor_agent import PetrichorAgent

petrichor = PetrichorAgent()

def summarize_article(text):
    if not text:
        return "No content to summarize."
    return petrichor.run_task("summarize", {"content": text})
