from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import llama_3_3_70b_versatile
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pshykickai.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/chat")
async def agent_call(body: PromptRequest):
    user_prompt = body.prompt
    llama_response = llama_3_3_70b_versatile(user_prompt, "You are an AI Scientist. Help the user work on Science.")
    print(llama_response)
    return {"llama_response": llama_response}

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        port=8000,
        host="0.0.0.0",
        reload=True,
    )