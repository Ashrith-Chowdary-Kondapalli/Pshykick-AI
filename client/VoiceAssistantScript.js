const sphere = document.querySelector('.sphere');
const cutCallBtn = document.getElementById('cut-btn');
const interfaceTrigger = document.getElementById('interface-trigger');
const muteBtn = document.getElementById('mute-btn');

sphere.addEventListener('mouseenter', () => {
    sphere.setAttribute('data-hovered', 'true');
});

sphere.addEventListener('mouseleave', () => {
    sphere.removeAttribute('data-hovered');
});

cutCallBtn.addEventListener('click', backToMainPage);
muteBtn.addEventListener('click', changeButton);
sphere.addEventListener('click', startAssistant);

function backToMainPage() {
    interfaceTrigger.checked = false;
}

function changeButton() {
    const isMuted = muteBtn.getAttribute('data-muted') === 'true';

    if (!isMuted) {
        muteBtn.setAttribute('data-muted', 'true');
        muteBtn.style.backgroundColor = '#5f6368'; // Turn dark grey
        
        // Swap icon to a Muted Microphone (with a slash line)
        muteBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17L12 8.19V5c0-1.66-1.34-3-3-3-.31 0-.6.05-.88.13l6.86 6.86c.02.06.02.12.02.18zm-10.6-8.9L3.11 3.54 7.6 8.03V11c0 2.76 2.24 5 5 5 .74 0 1.43-.16 2.05-.43l3.41 3.41 1.27-1.27L4.38 2.27zM11 21h2c0 .55-.45 1-1 1s-1-.45-1-1zm-6-10H3c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c-3.39-.49-6-3.39-6-6.92z"/>
            </svg>
        `;
    } else {
        muteBtn.setAttribute('data-muted', 'false');
        muteBtn.style.backgroundColor = ''; 
        
        muteBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 9h2c0 .55-.45 1-1 1s-1-.45-1-1zm6-12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
        `;
    }
}

function startAssistant() {
    let mediaRecorder;
    let audioChunks = [];
    let audioContext;
    let silenceTimer = null;

    const SILENCE_THRESHOLD = 0.015; 
    const SILENCE_DURATION = 1500;

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const preferredTypes = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/mp4"
        ];

        const supportedType = preferredTypes.find(
            type => MediaRecorder.isTypeSupported(type)
        );

        mediaRecorder = supportedType
            ? new MediaRecorder(stream, { mimeType: supportedType })
            : new MediaRecorder(stream);

        console.log("Selected recorder type:", mediaRecorder.mimeType);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = sendFile;

        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            
            let sum = 0;
            for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
            const rms = Math.sqrt(sum / input.length);

            if (rms < SILENCE_THRESHOLD) {
                if (!silenceTimer) {
                    silenceTimer = setTimeout(() => stopRecording(stream, processor), SILENCE_DURATION);
                }
            } else {
                if (silenceTimer) {
                    clearTimeout(silenceTimer);
                    silenceTimer = null;
                }
            }
        };

        mediaRecorder.start();
    }

    function stopRecording(stream, processor) {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
            processor.disconnect();
            audioContext.close();
            if (silenceTimer) clearTimeout(silenceTimer);
        }
    }

    async function sendFile() {
            const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
            const extension = mediaRecorder.mimeType.split('/')?.[1]?.split(';')?.[0] || 'webm';

            const formData = new FormData();
            formData.append('audioFile', blob, `recording.${extension}`);

            try {
                const API_BASE_URL = "https://pshykickai.onrender.com"; 
                console.log("Sending voice command to backend...");
                
                const response = await fetch(`${API_BASE_URL}/audio`, {
                    method: 'POST',
                    body: formData
                });
                console.log("Recorder MIME type:", mediaRecorder.mimeType);
                console.log("Uploaded Blob MIME type:", blob.type);

                if (!response.ok) {
                    const details = await response.text();
                    console.error("Audio API rejected upload:", response.status, details);
                    throw new Error(`HTTP ${response.status}: ${details}`);
                }

                // 🛠️ UPDATED: Hand the raw network response stream over to our handler
                receiveAudioResponse(response);
                
            } catch (error) {
                console.error("Error audio:", error);
            }
    }

    // 🛠️ BRAND NEW SEPARATE FUNCTION: Unpacks the blob stream and executes playback
    async function receiveAudioResponse(response) {
        try {
            // 1. Extract the raw audio binary data attachment (.blob()) from the connection
            const audioBlob = await response.blob();
            
            // 2. Generate a local, virtual address pointing directly to the blob data in memory
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 3. Instantiate the native browser audio engine with our temporary memory link
            const assistantVoice = new Audio(audioUrl);
            
            console.log("Playing back response from ElevenLabs!");
            
            // 4. Trigger audio playback out loud
            await assistantVoice.play();
            
        } catch (error) {
            console.error("Failed to unpack or play back audio response:", error);
        }
    }

    startRecording();
}
