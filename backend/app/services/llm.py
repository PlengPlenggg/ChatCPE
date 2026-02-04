from fastapi import HTTPException
# Temporarily disabled for faster builds
# from transformers import pipeline

class LLMService:
    def __init__(self):
        # self.model = pipeline("text-generation", model="your-trained-model")
        pass

    def generate_response(self, prompt: str) -> str:
        # Temporary mock response while LLM is disabled
        return f"Mock LLM response for: {prompt}"
        # try:
        #     response = self.model(prompt, max_length=150, num_return_sequences=1)
            return response[0]['generated_text']
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

llm_service = LLMService()