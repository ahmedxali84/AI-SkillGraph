import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

def get_agent(temperature: float = 0.2):
    groq_api_key = os.getenv("GROQ_API_KEY")
    return ChatGroq(
        temperature=temperature,
        model_name="llama-3.3-70b-versatile",
        groq_api_key=groq_api_key
    )
