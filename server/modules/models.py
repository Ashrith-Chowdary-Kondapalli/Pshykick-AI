import os
import types
from dotenv import load_dotenv
from google.genai.types import GenerateContentConfig
from google import genai
from groq import Groq
from elevenlabs.client import ElevenLabs
from elevenlabs import save
import io

load_dotenv()

# Clients
client = Groq(api_key=os.getenv("GROQ_API"))
client_gemini = genai.Client(api_key=os.getenv("GEMINI_API"))
client_elevanlabs = ElevenLabs(api_key=os.getenv("ELEVENLAB_API"))

# Model functions
def llama_3_3_70b_versatile(prompt, system_prompt):
        response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],  
        model="openai/gpt-oss-120b",
    )
        response_agent2 = response.choices[0].message.content
        return (f"{response_agent2}")

# Speech-to-Text
def whisper_turbov3(audio):
    # 1. Check if the audio is already a virtual 'io' object or raw bytes
    if isinstance(audio, (io.BytesIO, bytes)):
        # If it's a BytesIO object, read its data. If it's already raw bytes, use it directly.
        file_data = audio.read() if hasattr(audio, 'read') else audio
        # Give it a generic default voice extension so the AI knows the format layout
        filename = "input_voice.webm" 
    else:
        # 2. Otherwise, treat it as a traditional string file path
        filename = audio
        with open(audio, "rb") as file:
            file_data = file.read()

    # 3. Pass the tuple directly to the AI model
    transcription = client.audio.transcriptions.create(
        file=(filename, file_data), # Uses your exact tuple logic!
        model="whisper-large-v3-turbo",
        temperature=0,
        response_format="verbose_json",
    )
    return transcription.text
def gemini_flashlite(user_prompt, system_prompt):

    # Run the Flash-Lite request with system instructions
    response = client_gemini.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=user_prompt,
        config=GenerateContentConfig(
            system_instruction=system_prompt,
        ),
    )

    return response.text

# Text-to-Speech
def elevenlabs_v3(text, output_file_name="speech.wav"):
    try:
        # Generate the audio stream
        audio_stream = client_elevanlabs.text_to_speech.convert(
            text=text,
            voice_id="pNInz6obpgDQGcFmaJgB",  # Standard high-quality voice ID (e.g., Jessica)
            model_id="eleven_v3",              # CRUCIAL: Only v3 processes bracketed [laughs]/[cry] handles
            output_format="mp3_44100_128"      # Balanced quality setting
        )
        
        # Save the returned generator data blocks into a physical MP3 file
        save(audio_stream, output_file_name)
        return output_file_name

    except Exception as e:
        print(f"❌ ElevenLabs Generation Error: {e}")
        return None


