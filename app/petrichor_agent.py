import os
import openai

class PetrichorAgent:
    def __init__(self):
        self.model = "gpt-4"
        self.api_key = os.getenv("OPENAI_API_KEY")

    def respond(self, prompt):
        try:
            openai.api_key = self.api_key
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful news summarizer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[ERROR] PetrichorAgent failed: {e}")
            return "Error generating response."
