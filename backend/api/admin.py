from django.contrib import admin
from .models import (
    Resume, ResumeAnalysis, Skill, JobDescription, JobMatch,
    AnalysisTemplate, AuditLog
)


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ["filename", "user", "file_size", "uploaded_at"]
    list_filter = ["uploaded_at", "user"]
    search_fields = ["filename", "user__username"]
    readonly_fields = ["uploaded_at", "updated_at"]


@admin.register(ResumeAnalysis)
class ResumeAnalysisAdmin(admin.ModelAdmin):
    list_display = ["resume", "overall_score", "status", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["resume__filename"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["name", "level", "is_in_demand", "match_score"]
    list_filter = ["level", "is_in_demand"]
    search_fields = ["name"]


@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "location", "created_at"]
    list_filter = ["created_at", "company"]
    search_fields = ["title", "company"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(JobMatch)
class JobMatchAdmin(admin.ModelAdmin):
    list_display = ["analysis", "job", "match_score"]
    list_filter = ["match_score", "created_at"]
    search_fields = ["job__title", "analysis__resume__filename"]
    readonly_fields = ["created_at"]


@admin.register(AnalysisTemplate)
class AnalysisTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "created_at"]
    list_filter = ["category", "created_at"]
    search_fields = ["name"]
    readonly_fields = ["created_at"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["user", "action", "resource_type", "created_at"]
    list_filter = ["action", "resource_type", "created_at"]
    search_fields = ["user__username", "action"]
    readonly_fields = ["created_at"]

