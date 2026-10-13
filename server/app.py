from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse  # 🛠️ IMPORT THIS FOR SENDING PHYSICAL FILE PATHS
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from modules.models import gemini_flashlite, whisper_turbov3, llama_3_3_70b_versatile, elevenlabs_v3
import json
import io
import os  # To handle file checks and cleanups if necessary
from modules.system_prompts import gemini_sysprompt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pshykickai.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024  
ALLOWED_MIME_TYPES = {"audio/wav", "audio/webm", "audio/mp3", "audio/mpeg", "audio/m4a", "audio/x-m4a"}

class PromptRequest(BaseModel):
    prompt: str

@app.post("/chat")
async def agent_call(body: PromptRequest):
    user_prompt = body.prompt
    llama_response = llama_3_3_70b_versatile(user_prompt, "You are an AI Scientist. Help the user work on Science.")
    print(llama_response)
    return {"llama_response": llama_response}

@app.post("/audio")
async def receive_audio_stream(audioFile: UploadFile = File(...)):
    content_type = (audioFile.content_type or "").lower()
    base_mime_type = content_type.split(";")[0].strip()

    if base_mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid audio format '{audioFile.content_type}'."
        )

    try:
        audio_data = await audioFile.read()
        
        byte_size = len(audio_data)
        if byte_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Uploaded file size exceeds the strict 10MB limit."
            )

        print(f"Processing Voice Stream: {audioFile.filename} | Size: {byte_size} bytes")
        
        # 1. Transcribe voice in memory using your module
        virtual_file = io.BytesIO(audio_data)
        virtual_file.name = audioFile.filename 
        transcription = whisper_turbov3(virtual_file)
        
        # 2. Query Gemini
        response_text = gemini_flashlite(transcription, gemini_sysprompt)
        
        # 3. 🛠️ ELEVENLABS CAPTURE (Returns a file path string)
        # e.g., output_file_path = "speech.wav"
        output_file_path = elevenlabs_v3(response_text, output_file_name="speech.wav")
        
        # Double check the file actually exists on the disk before trying to send it
        if not os.path.exists(output_file_path):
            raise HTTPException(status_code=500, detail="ElevenLabs failed to create the audio file path.")

        print(f"Streaming physical audio file back to frontend: {output_file_path}")

        # 4. 🛠️ SHIFT PHYSICAL FILE TO JAVASCRIPT
        # FileResponse takes a path string, sets up non-blocking I/O chunks, and handles content lengths automatically
        return FileResponse(
            path=output_file_path, 
            media_type="audio/wav", 
            filename="response.wav"
        )
        
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        print(f"Internal systems tracker error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline loop processing error: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("app:app", port=8000, host="0.0.0.0", reload=True)
