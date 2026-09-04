import { marked } from "https://cdn.jsdelivr.net/npm/marked/+esm";

marked.use({
    breaks: true,
    gfm: true
});

const userPrompt = document.getElementById("prompt");
const submitBtn = document.getElementById("submit");
const chatHistory = document.getElementById("chatHistory");

// Base URL for your Render backend
// Replace with your actual Render service URL once deployed
const API_BASE_URL = "https://pshykickai.onrender.com"; 

submitBtn.addEventListener("click", serverConnect);

async function serverConnect() {
    const prompt = userPrompt.value;
    if (!prompt.trim()) return; // Don't send empty prompts

    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const Rawdata = await response.json();
        console.log(Rawdata.llama_response);
        
        const llama_marked = await marked.parse(Rawdata.llama_response);
        
        chatHistory.insertAdjacentHTML("beforeend", `
            <div class="user-turn">
                <strong>You:</strong> ${prompt}
            </div>
            <div class="ai-turn">
                <strong>AI:</strong> <div>${llama_marked}</div>
            </div>
            <hr style="margin: 20px 0; border: 0; border-top: 1px dashed #ccc;">
        `);

        userPrompt.value = ""; // Clear input after sending
    } catch (error) {
        console.error("Failed to connect to backend:", error);
        chatHistory.insertAdjacentHTML("beforeend", `
            <div class="error-msg" style="color: red;">
                <strong>System:</strong> Failed to reach server. Please try again.
            </div>
        `);
    }
}