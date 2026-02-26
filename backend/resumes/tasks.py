# resumes/tasks.py

from celery import shared_task
from .models import Resume
from .utils import extract_resume_text
import random

@shared_task
def analyze_resume_task(resume_id):
    try:
        resume = Resume.objects.get(id=resume_id)
        resume.status = "PROCESSING"
        resume.save()

        text = extract_resume_text(resume.file.path)
        resume.extracted_text = text

        # 🔥 Temporary dummy AI logic (replace with real LLM later)
        resume.skills = ["Python", "Django", "REST", "Docker"]
        resume.ats_score = random.randint(60, 90)
        resume.suggestions = [
            "Add measurable achievements",
            "Improve project descriptions",
            "Include DevOps experience"
        ]

        resume.status = "DONE"
        resume.save()

    except Exception as e:
        resume.status = "FAILED"
        resume.save()