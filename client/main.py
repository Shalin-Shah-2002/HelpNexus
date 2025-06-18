from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import pipeline
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React app's origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load sentiment analysis model
classifier = pipeline(
    "sentiment-analysis",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
    revision="714eb0f",  # Optional, but ensures version stability
    device=-1  # CPU (use 0 for GPU)
)

class FeedbackRequest(BaseModel):
    text: str

@app.post("/analyze")   
async def analyze_feedback(request: FeedbackRequest):
    try:
        print(f"Received text for analysis: {request.text}")
        result = classifier(request.text)
        print(f"Analysis result: {result}")
        return {"label": result[0]['label'], "score": result[0]['score']}
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")
        return {"label": "NEUTRAL", "score": 0.5}

@app.get("/")
async def root():
    return {"message": "FastAPI Sentiment Analysis Server is running!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
