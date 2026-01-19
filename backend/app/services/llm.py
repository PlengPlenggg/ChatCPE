from fastapi import HTTPException
from transformers import pipeline

class LLMService:
    def __init__(self):
        self.model = pipeline("text-generation", model="your-trained-model")

    def generate_response(self, prompt: str) -> str:
        try:
            response = self.model(prompt, max_length=150, num_return_sequences=1)
            return response[0]['generated_text']
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

llm_service = LLMService()