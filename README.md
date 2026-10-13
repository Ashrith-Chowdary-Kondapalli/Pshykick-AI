# 🧠 Pshykick AI

**A web-based AI chatbot and voice assistant powered by modern AI models.**

Pshykick AI is an experimental AI workspace that lets users interact with AI through text or voice. It combines a browser-based frontend with a FastAPI backend to process prompts, transcribe speech, generate AI responses, and return spoken audio.

The project integrates Groq, Google Gemini, Whisper, and ElevenLabs to create a conversational experience with both text and voice interaction.

## ✨ Features

- 💬 **AI Chatbot** — Submit text prompts and receive AI-generated responses.
- 🎙️ **Voice Assistant** — Speak through your microphone and interact with the assistant using voice.
- 📝 **Speech-to-Text** — Transcribe recorded audio using Groq's Whisper API.
- 🧠 **AI Response Generation** — Generate responses using Groq-hosted language models and Google Gemini.
- 🔊 **Text-to-Speech** — Generate spoken responses using ElevenLabs.
- 🌐 **Web-Based Interface** — Access the chatbot and voice assistant through a browser.
- 🎨 **Interactive UI** — Includes a rotating 3D sphere animation and microphone controls in the voice interface.
- ⚡ **REST API** — Uses FastAPI to connect the frontend to the AI services.

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| Text AI | Groq API |
| Voice transcription | Whisper via Groq |
| Voice response generation | Google Gemini |
| Text-to-speech | ElevenLabs |
| API server | Uvicorn |
| Deployment | Netlify (frontend), Render (backend) |

## 🏗️ Architecture

Pshykick AI has two main interaction flows.

### Text chatbot

1. The user enters a prompt in the browser.
2. JavaScript sends a POST request to the FastAPI `/chat` endpoint.
3. The backend sends the prompt to a language model through Groq.
4. The generated response is returned as JSON.
5. The frontend renders the response as Markdown.

### Voice assistant

1. The browser requests microphone access and records the user's voice.
2. Recording stops after a period of detected silence.
3. JavaScript uploads the audio to the backend's `/audio` endpoint.
4. Groq Whisper transcribes the audio into text.
5. Google Gemini generates a conversational response.
6. ElevenLabs converts the response into speech.
7. The backend returns an audio file, and the browser plays it.

```text
                    PSHYKICK AI
                         |
              +----------+----------+
              |                     |
         Text Chat              Voice Assistant
              |                     |
        JavaScript UI          Microphone Recording
              |                     |
           POST /chat           POST /audio
              |                     |
           FastAPI                FastAPI
              |                     |
        Groq Language Model    Groq Whisper
              |                     |
          JSON Response         Transcription
              |                     |
        Markdown Rendering     Google Gemini
                                    |
                                 ElevenLabs
                                    |
                               Audio Response
                                    |
                              Browser Playback
```

## 📂 Project Structure

```text
Pshykick-AI/
├── client/
│   ├── index.html                # Main landing page
│   ├── ChatBot.html              # Text chatbot interface
│   ├── VoiceAssistant.html       # Voice assistant interface
│   ├── VoiceAssistantScript.js   # Recording and voice interaction
│   ├── script.js                 # Chatbot API integration
│   └── style.css                 # Chatbot styles
│
├── server/
│   ├── app.py                    # FastAPI application and endpoints
│   ├── requirements.txt          # Python dependencies
│   └── modules/
│       ├── models.py             # AI, transcription and TTS integrations
│       └── system_prompts.py     # Voice assistant system prompt
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Python 3.10 or newer recommended.
- Git.
- A modern browser with microphone access for voice interaction.
- API credentials for Groq, Google Gemini, and ElevenLabs.

### 1. Clone the repository

```bash
git clone https://github.com/Ashrith-Chowdary-Kondapalli/Pshykick-AI.git
cd Pshykick-AI
```

### 2. Set up the Python environment

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it.

**Windows (PowerShell):**

```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r server/requirements.txt
```

### 4. Configure API keys

Create a `.env` file inside the `server/` directory.

```env
GROQ_API=your_groq_api_key
GEMINI_API=your_google_gemini_api_key
ELEVENLAB_API=your_elevenlabs_api_key
```

Replace the placeholder values with your own API credentials.

**Important:** Never commit your `.env` file or publish API keys in source code, screenshots, logs, or documentation.

### 5. Start the backend

From the repository root, run:

```bash
cd server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available locally at:

- API base URL: `http://localhost:8000`
- Interactive API documentation: `http://localhost:8000/docs`

### 6. Start the frontend

Serve the `client/` directory using a local static web server. For example, from the repository root:

```bash
python -m http.server 5500 --directory client
```

Open `http://localhost:5500` in your browser.

> **Note:** The frontend currently uses a deployed Render API URL in its JavaScript. For local development, update the API base URL in `script.js` and `VoiceAssistantScript.js` to `http://localhost:8000`. The backend's CORS configuration must also allow your local frontend origin, such as `http://localhost:5500`.

## 🔌 API Endpoints

### `POST /chat`

Accepts a text prompt and returns a generated AI response.

**Request:**

```json
{
  "prompt": "Explain black holes in simple terms."
}
```

**Successful response:**

```json
{
  "llama_response": "Black holes are regions of space where gravity is so strong that even light cannot escape."
}
```

The response text is generated through the configured Groq model.

### `POST /audio`

Accepts an uploaded audio file as multipart form data, transcribes it, generates a response, and returns spoken audio.

**Form field:**

| Field | Type | Description |
|---|---|---|
| `audioFile` | File | Recorded audio uploaded by the browser |

The backend checks the audio MIME type and enforces a 10 MB upload limit.

**Successful response:** An audio file returned as a downloadable HTTP response for playback in the browser.

**Common errors:**

| Status | Meaning |
|---|---|
| `400 Bad Request` | Unsupported audio MIME type |
| `413 Payload Too Large` | Audio exceeds the 10 MB limit |
| `500 Internal Server Error` | An error occurred while processing the audio or generating the response |

## 🔐 Environment Variables

| Variable | Purpose |
|---|---|
| `GROQ_API` | Authenticates requests to Groq for language generation and transcription |
| `GEMINI_API` | Authenticates requests to Google Gemini |
| `ELEVENLAB_API` | Authenticates requests to ElevenLabs |

The backend loads environment variables using `python-dotenv`.

Keep these credentials private and configure them through your deployment provider's environment-variable settings in production.

## ☁️ Deployment

### Frontend — Netlify

Deploy the `client/` directory as a static website.

Ensure that:
- The published directory is `client/`.
- The JavaScript API base URL points to the deployed backend.
- The deployed frontend origin is included in the backend's CORS configuration.

### Backend — Render

Deploy the `server/` directory as a Python web service.

A typical start command is:

```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```

Configure the following environment variables in Render:

- `GROQ_API`
- `GEMINI_API`
- `ELEVENLAB_API`

Make sure the frontend uses the correct deployed backend URL and that the backend permits requests from the frontend's exact origin.

## 🧪 Troubleshooting

### Voice assistant returns HTTP 400

Check the uploaded audio MIME type in the browser console. Browser recordings may include codec parameters, such as `audio/webm;codecs=opus`.

The backend should validate the base MIME type consistently rather than requiring an exact match against a MIME string without codec parameters.

### Browser reports a CORS error

Check the `allow_origins` configuration in `server/app.py`. The origin must match the actual frontend URL, including the scheme and hostname.

### Voice response takes a while

Voice processing involves transcription, AI response generation, and text-to-speech generation. Each stage adds latency. Inspect the Render logs and browser console to determine which stage is taking the longest.

### Text chat fails

Check the browser console and backend logs. Verify the Groq API key, configured model availability, and the HTTP response from `/chat`.

### Audio is returned but playback fails

Verify that the returned audio's actual encoding matches the response's declared media type. For example, MP3 output should be served as `audio/mpeg`, not `audio/wav`.

## 🔮 Future Improvements

Potential enhancements include:

- Displaying live states such as **Listening**, **Thinking**, and **Generating voice**.
- Improving speech processing latency.
- Adding streaming responses and incremental audio playback.
- Replacing deprecated `ScriptProcessorNode` audio processing with `AudioWorklet`.
- Supporting configurable voices and response styles.
- Improving error messages and request logging.
- Adding automated tests for API endpoints and audio processing.

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Submit a pull request with a description of the improvement.

## 📄 License

No license information has been confirmed in this draft. Add a `LICENSE` file and update this section before distributing the project or specifying reuse permissions.

---

**Built with curiosity, code, and a voice that might just jumpscare you.** 🤖🔊
