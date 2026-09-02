import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API"))

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
        model="groq/compound",
    )
        response_agent2 = response.choices[0].message.content
        return (f"{response_agent2}")