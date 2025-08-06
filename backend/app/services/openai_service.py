# backend/app/services/openai_service.py
import os
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_queries(user_prompt: str) -> str:
    system = (
        "You are a YouTube-data assistant. "
        "When given a request like “I want market analysis on top padel channels,” "
        "Do not add any extra commentary your output should only be a list of sample queries you would search on youtube to get the top padel channels."
    )
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user_prompt},
        ],
        max_tokens=200,
        temperature=0.3,
    )
    return resp.choices[0].message.content.strip()
