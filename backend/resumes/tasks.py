# resumes/tasks.py

from celery import shared_task
from .models import Resume
from .utils import extract_resume_text
from .gemini_service import analyze_resume_with_gemini


@shared_task
def analyze_resume_task(resume_id):
    resume = Resume.objects.get(id=resume_id)

    try:
        resume.status = "PROCESSING"
        resume.save()

        text = extract_resume_text(resume.file.path)
        resume.extracted_text = text

        # 🔥 REAL AI CALL
        result = analyze_resume_with_gemini(text)

        resume.skills = result.get("skills")
        resume.ats_score = result.get("ats_score")
        resume.suggestions = result.get("suggestions")

        resume.status = "DONE"
        resume.save()

    except Exception as e:
        resume.status = "FAILED"
        resume.save()
        raise e