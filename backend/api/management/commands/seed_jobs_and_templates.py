from django.core.management.base import BaseCommand
from api.models import JobDescription, AnalysisTemplate


class Command(BaseCommand):
    help = "Seed the database with sample job descriptions and analysis templates"

    def handle(self, *args, **options):
        self.stdout.write("Seeding job descriptions...")
        self._seed_jobs()
        
        self.stdout.write("Seeding analysis templates...")
        self._seed_templates()
        
        self.stdout.write(self.style.SUCCESS("Successfully seeded database"))

    @staticmethod
    def _seed_jobs():
        """Create sample job descriptions."""
        jobs = [
            {
                "title": "Senior Frontend Engineer",
                "company": "TechCorp",
                "location": "San Francisco, CA",
                "salary_min": 180000,
                "salary_max": 220000,
                "description": "We are looking for a Senior Frontend Engineer with 5+ years of experience. You will be responsible for building and maintaining our modern web applications using React and TypeScript.",
                "required_skills": ["React", "TypeScript", "JavaScript", "CSS", "HTML", "REST APIs", "Git"]
            },
            {
                "title": "Full Stack Developer",
                "company": "StartupXYZ",
                "location": "Remote",
                "salary_min": 150000,
                "salary_max": 190000,
                "description": "Join our startup as a Full Stack Developer. Work on both frontend (React) and backend (Node.js) technologies. Must have experience with databases and APIs.",
                "required_skills": ["React", "Node.js", "PostgreSQL", "JavaScript", "REST APIs", "Docker", "Git"]
            },
            {
                "title": "Software Engineer II",
                "company": "BigTech Inc",
                "location": "New York, NY",
                "salary_min": 160000,
                "salary_max": 200000,
                "description": "As a Software Engineer II, you'll develop scalable backend systems. Experience with Python, cloud platforms (AWS), and distributed systems is required.",
                "required_skills": ["Python", "AWS", "PostgreSQL", "Docker", "Kubernetes", "REST APIs", "Git"]
            },
            {
                "title": "Frontend Lead",
                "company": "DesignStudio",
                "location": "Austin, TX",
                "salary_min": 170000,
                "salary_max": 210000,
                "description": "Lead our frontend team and drive technical decisions. Experience with React, design systems, and mentoring is essential.",
                "required_skills": ["React", "TypeScript", "Design Systems", "CSS", "Leadership", "Testing", "Git"]
            },
            {
                "title": "DevOps Engineer",
                "company": "CloudServices",
                "location": "Remote",
                "salary_min": 140000,
                "salary_max": 180000,
                "description": "Manage and optimize our cloud infrastructure. Experience with AWS, Kubernetes, and CI/CD pipelines is crucial.",
                "required_skills": ["AWS", "Kubernetes", "Docker", "CI/CD", "Terraform", "Python", "Git"]
            },
            {
                "title": "Data Engineer",
                "company": "DataCorp",
                "location": "Boston, MA",
                "salary_min": 155000,
                "salary_max": 195000,
                "description": "Design and implement data pipelines. Must have expertise in data warehousing, ETL, and big data technologies.",
                "required_skills": ["Python", "SQL", "Apache Spark", "Airflow", "AWS", "Snowflake", "Git"]
            },
            {
                "title": "Backend Engineer",
                "company": "FinTech Solutions",
                "location": "remote",
                "salary_min": 160000,
                "salary_max": 200000,
                "description": "Build robust backend services for our fintech platform. Expertise in Java, microservices, and cloud platforms required.",
                "required_skills": ["Java", "Spring Boot", "PostgreSQL", "Microservices", "AWS", "Docker", "Git"]
            },
            {
                "title": "QA Automation Engineer",
                "company": "TechCorp",
                "location": "San Francisco, CA",
                "salary_min": 120000,
                "salary_max": 160000,
                "description": "Develop automated test suites and frameworks. Experience with Selenium, Jest, and CI/CD integration required.",
                "required_skills": ["Selenium", "JavaScript", "Python", "Jest", "CI/CD", "Git", "Testing"]
            }
        ]

        for job_data in jobs:
            JobDescription.objects.get_or_create(
                title=job_data["title"],
                company=job_data["company"],
                defaults={
                    "location": job_data["location"],
                    "salary_min": job_data["salary_min"],
                    "salary_max": job_data["salary_max"],
                    "description": job_data["description"],
                    "required_skills": job_data["required_skills"]
                }
            )

    @staticmethod
    def _seed_templates():
        """Create sample analysis templates."""
        templates = [
            {
                "name": "Strong Keywords",
                "description": "Resume contains strong industry keywords",
                "content": "Your resume effectively uses industry-specific keywords which will help with ATS (Applicant Tracking System) scanning and recruiter searches.",
                "category": "feedback"
            },
            {
                "name": "Weak Keywords",
                "description": "Resume lacks industry-specific keywords",
                "content": "Consider adding more industry-specific keywords relevant to your target positions. This will improve your resume's visibility in ATS systems and recruiter searches.",
                "category": "suggestions"
            },
            {
                "name": "Strong Action Verbs",
                "description": "Resume uses powerful action verbs",
                "content": "Great job using strong action verbs throughout your resume. This makes your accomplishments more impactful and easier for recruiters to quickly understand your contributions.",
                "category": "feedback"
            },
            {
                "name": "Weak Action Verbs",
                "description": "Resume lacks powerful action verbs",
                "content": "Try replacing generic phrases like 'responsible for' with stronger action verbs such as 'developed', 'managed', 'led', or 'optimized' to make your accomplishments more compelling.",
                "category": "suggestions"
            },
            {
                "name": "Quantified Achievements",
                "description": "Resume includes measurable metrics",
                "content": "Excellent use of quantified achievements! Numbers and metrics make your accomplishments concrete and impressive to hiring managers.",
                "category": "feedback"
            },
            {
                "name": "Missing Quantification",
                "description": "Resume lacks measurable metrics",
                "content": "Add specific metrics and numbers to your achievements where possible. For example, 'increased revenue by 25%' or 'reduced response time from 5s to 2s' is more impactful than general statements.",
                "category": "suggestions"
            },
            {
                "name": "Professional Summary",
                "description": "Tips for writing a professional summary",
                "content": "A strong professional summary (2-3 lines) at the top of your resume can immediately capture a recruiter's attention. Include your key professional achievements and what you're looking for in your next role.",
                "category": "tips"
            },
            {
                "name": "Skills Section",
                "description": "Tips for organizing the skills section",
                "content": "Organize your skills by proficiency level or category. Group related skills together (e.g., Languages, Databases, Tools) to make it easier for recruiters to quickly find relevant qualifications.",
                "category": "tips"
            },
            {
                "name": "Formatting Best Practices",
                "description": "Resume formatting recommendations",
                "content": "Use consistent formatting with clear section headers, bullet points, and appropriate white space. Stick to standard fonts like Arial or Calibri. Avoid excessive colors or graphics that may confuse ATS systems.",
                "category": "tips"
            },
            {
                "name": "Dates and Timeline",
                "description": "Tips for presenting work history",
                "content": "Always include clear date ranges for your work experience. Use a consistent format (MM/YYYY or similar) and ensure your timeline is easy to follow. Address any employment gaps briefly if needed.",
                "category": "tips"
            }
        ]

        for template_data in templates:
            AnalysisTemplate.objects.get_or_create(
                name=template_data["name"],
                defaults={
                    "description": template_data["description"],
                    "content": template_data["content"],
                    "category": template_data["category"]
                }
            )
