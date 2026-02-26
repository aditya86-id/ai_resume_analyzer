# resumes/gemini_service.py

import google.generativeai as genai
import os
import json

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")


def analyze_resume_with_gemini(text):
    prompt = f"""
    You are an ATS resume analyzer.

    Extract:
    1. Skills list
    2. ATS score (0-100)
    3. Improvement suggestions

    Resume:
    {text}

    Return ONLY valid JSON:
    {{
        "skills": [],
        "ats_score": number,
        "suggestions": []
    }}
    """

    response = model.generate_content(prompt)

    try:
        cleaned = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned)
    except:
        return {
            "skills": [],
            "ats_score": 50,
            "suggestions": ["AI parsing failed"]
        }