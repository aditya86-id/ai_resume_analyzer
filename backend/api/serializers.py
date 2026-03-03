from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Resume, ResumeAnalysis, Skill, JobDescription, JobMatch,
    AnalysisTemplate, AuditLog
)


# ========================================================
# User Serializers
# ========================================================

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password_confirm", "first_name", "last_name"]
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, data):
        if data["password"] != data.pop("password_confirm"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if not data.get('username') and not data.get('email'):
            raise serializers.ValidationError("Either username or email is required.")
        return data


# ========================================================
# Skill Serializers
# ========================================================

class SkillSerializer(serializers.ModelSerializer):
    """Serializer for Skill model."""
    
    class Meta:
        model = Skill
        fields = ["id", "name", "level", "is_in_demand", "match_score"]


# ========================================================
# Resume Analysis Serializers
# ========================================================

class ResumeAnalysisDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for ResumeAnalysis with skills and advanced analysis."""
    skills = SkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = ResumeAnalysis
        fields = [
            "id", "overall_score", "format_score", "keywords_score",
            "experience_score", "education_score", "impact_score",
            "feedback", "suggestions", "ai_suggestions", "strengths",
            "resume_quality_summary", "ats_analysis", "pattern_issues",
            "ats_recommendations", "career_stage", "industry_match",
            "status", "skills", "created_at", "updated_at"
        ]
        read_only_fields = fields


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for ResumeAnalysis."""
    
    class Meta:
        model = ResumeAnalysis
        fields = [
            "id", "overall_score", "format_score", "keywords_score",
            "experience_score", "education_score", "impact_score",
            "feedback", "suggestions", "ai_suggestions", "strengths",
            "resume_quality_summary", "ats_analysis", "pattern_issues",
            "ats_recommendations", "career_stage", "industry_match",
            "status", "created_at", "updated_at"
        ]
        read_only_fields = fields


# ========================================================
# Resume Serializers
# ========================================================

class ResumeListSerializer(serializers.ModelSerializer):
    """Serializer for Resume list view."""
    analysis = ResumeAnalysisSerializer(read_only=True)
    
    class Meta:
        model = Resume
        fields = ["id", "filename", "file_size", "uploaded_at", "analysis"]
        read_only_fields = fields


class ResumeDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Resume."""
    analysis = ResumeAnalysisDetailSerializer(read_only=True)
    
    class Meta:
        model = Resume
        fields = ["id", "filename", "file_size", "uploaded_at", "updated_at", "analysis"]
        read_only_fields = fields


class ResumeUploadSerializer(serializers.ModelSerializer):
    """Serializer for resume file upload."""
    file = serializers.FileField(required=True)
    
    class Meta:
        model = Resume
        fields = ["id", "file", "filename", "file_size", "uploaded_at"]
        read_only_fields = ["id", "filename", "file_size", "uploaded_at"]

    def validate_file(self, value):
        """Validate that file is PDF or DOCX."""
        allowed_extensions = ['.pdf', '.docx']
        filename = value.name.lower()
        if not any(filename.endswith(ext) for ext in allowed_extensions):
            raise serializers.ValidationError(
                f"Only PDF and DOCX files are supported. Got: {value.name}"
            )
        return value

    def create(self, validated_data):
        file = validated_data.get("file")
        resume = Resume(
            user=self.context["request"].user,
            file=file,
            filename=file.name,
            file_size=file.size
        )
        resume.save()
        return resume


# ========================================================
# Job Description Serializers
# ========================================================

class JobDescriptionSerializer(serializers.ModelSerializer):
    """Serializer for JobDescription."""
    
    class Meta:
        model = JobDescription
        fields = [
            "id", "title", "company", "location", "salary_min", "salary_max",
            "description", "required_skills", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


# ========================================================
# Job Match Serializers
# ========================================================

class JobMatchSerializer(serializers.ModelSerializer):
    """Serializer for JobMatch."""
    job = JobDescriptionSerializer(read_only=True)
    
    class Meta:
        model = JobMatch
        fields = ["id", "job", "match_score", "matched_skills", "missing_skills", "created_at"]
        read_only_fields = fields


# ========================================================
# Analysis Template Serializers
# ========================================================

class AnalysisTemplateSerializer(serializers.ModelSerializer):
    """Serializer for AnalysisTemplate."""
    
    class Meta:
        model = AnalysisTemplate
        fields = ["id", "name", "description", "content", "category", "created_at"]
        read_only_fields = ["id", "created_at"]


# ========================================================
# Audit Log Serializers
# ========================================================

class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog."""
    username = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ["id", "username", "action", "resource_type", "resource_id", "details", "created_at"]
        read_only_fields = fields
