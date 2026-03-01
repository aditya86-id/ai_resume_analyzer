from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Resume(models.Model):
    """Resume document uploaded by user for analysis."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")
    file = models.FileField(upload_to="resumes/%Y/%m/%d/")
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-uploaded_at"]
        indexes = [
            models.Index(fields=["-uploaded_at"]),
            models.Index(fields=["user", "-uploaded_at"]),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.filename}"


class ResumeAnalysis(models.Model):
    """AI-generated analysis of resume."""
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name="analysis")
    
    # Overall Score
    overall_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Score Breakdown
    format_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    keywords_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    experience_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    education_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    impact_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    
    # Feedback and Suggestions
    feedback = models.TextField()
    suggestions = models.JSONField(default=list)  # List of improvement suggestions
    
    # Extracted Information
    extracted_text = models.TextField(blank=True)
    
    # Status
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("analyzing", "Analyzing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"Analysis of {self.resume.filename}"


class Skill(models.Model):
    """Skills extracted from resume."""
    analysis = models.ForeignKey(ResumeAnalysis, on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=100)
    level = models.CharField(
        max_length=20,
        choices=[
            ("beginner", "Beginner"),
            ("intermediate", "Intermediate"),
            ("advanced", "Advanced"),
            ("expert", "Expert"),
        ],
        default="intermediate"
    )
    is_in_demand = models.BooleanField(default=False)
    match_score = models.FloatField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    class Meta:
        unique_together = ["analysis", "name"]
        verbose_name_plural = "Skills"

    def __str__(self):
        return f"{self.name} - {self.level}"


class JobDescription(models.Model):
    """Job descriptions for matching against resumes."""
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    description = models.TextField()
    required_skills = models.JSONField(default=list)  # List of required skill names
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} at {self.company}"


class JobMatch(models.Model):
    """Match between resume analysis and job descriptions."""
    analysis = models.ForeignKey(ResumeAnalysis, on_delete=models.CASCADE, related_name="job_matches")
    job = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name="matches")
    match_score = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    matched_skills = models.JSONField(default=list)  # List of matched skill names
    missing_skills = models.JSONField(default=list)  # List of missing skill names
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["analysis", "job"]
        ordering = ["-match_score"]

    def __str__(self):
        return f"{self.analysis.resume.filename} matches {self.job.title} ({self.match_score}%)"


class AnalysisTemplate(models.Model):
    """Templates for resume analysis feedback."""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=[
            ("suggestions", "Suggestions"),
            ("feedback", "Feedback"),
            ("tips", "Tips"),
        ],
        default="feedback"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.category})"


class AuditLog(models.Model):
    """Audit log for tracking user actions."""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="audit_logs")
    action = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=50)  # e.g., "resume", "analysis"
    resource_id = models.IntegerField(null=True, blank=True)
    details = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.action}"