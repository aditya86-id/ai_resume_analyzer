from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r"jobs", views.JobDescriptionViewSet, basename="job")
router.register(r"templates", views.AnalysisTemplateViewSet, basename="template")

urlpatterns = [
    # Router endpoints
    path("", include(router.urls)),

    # Health check
    path("health/", views.health_check, name="health_check"),

    # Authentication
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("auth/user/", views.UserDetailView.as_view(), name="user_detail"),

    # Resumes
    path("resumes/", views.ResumeListView.as_view(), name="resume_list"),
    path("resumes/upload/", views.ResumeUploadView.as_view(), name="resume_upload"),
    path("resumes/<int:pk>/", views.ResumeDetailView.as_view(), name="resume_detail"),

    # Resume Analysis
    path("analyze/", views.AnalyzeResumeView.as_view(), name="analyze_resume"),
    path("resumes/<int:resume_id>/analysis/", views.ResumeAnalysisDetailView.as_view(), name="analysis_detail"),

    # Skills
    path("resumes/<int:resume_id>/skills/", views.SkillListView.as_view(), name="skill_list"),

    # Job Matching
    path("resumes/<int:resume_id>/matching/", views.JobMatchingView.as_view(), name="job_matching"),

    # Dashboard
    path("dashboard/stats/", views.DashboardStatsView.as_view(), name="dashboard_stats"),

    # Audit Logs
    path("audit-logs/", views.AuditLogListView.as_view(), name="audit_logs"),
]
