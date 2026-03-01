import os
import logging
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from rest_framework import status, generics, permissions, viewsets, mixins
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication

from .models import (
    Resume, ResumeAnalysis, Skill, JobDescription, JobMatch,
    AnalysisTemplate, AuditLog
)
from .serializers import (
    UserRegisterSerializer, UserSerializer, UserLoginSerializer,
    ResumeUploadSerializer, ResumeListSerializer, ResumeDetailSerializer,
    ResumeAnalysisSerializer, ResumeAnalysisDetailSerializer,
    SkillSerializer, JobDescriptionSerializer, JobMatchSerializer,
    AnalysisTemplateSerializer, AuditLogSerializer
)
from .services import TextExtractor, ResumeAnalyzerService, JobMatchingService, AuditService

logger = logging.getLogger(__name__)


# ========================================================
# Authentication Views
# ========================================================

class RegisterView(generics.CreateAPIView):
    """Register a new user."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Create auth token
        Token.objects.create(user=user)
        AuditService.log_action(user, "User registered", "user", user.id)


class LoginView(generics.GenericAPIView):
    """Login user and return token."""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        username = serializer.validated_data.get("username")
        password = serializer.validated_data.get("password")

        # Try to find user by email or username
        user = None
        if email:
            user = User.objects.filter(email=email).first()
        elif username:
            user = User.objects.filter(username=username).first()
        
        if not user or not user.check_password(password):
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, _ = Token.objects.get_or_create(user=user)
        AuditService.log_action(user, "User logged in", "user", user.id)

        return Response({
            "user": UserSerializer(user).data,
            "token": token.key,
            "message": "Login successful"
        })


class LogoutView(generics.GenericAPIView):
    """Logout user and delete token."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        AuditService.log_action(request.user, "User logged out", "user", request.user.id)
        return Response({"message": "Logout successful"})


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Get or update user details."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_object(self):
        return self.request.user


# ========================================================
# Resume Views
# ========================================================

class ResumeUploadView(generics.CreateAPIView):
    """Upload a resume file."""
    serializer_class = ResumeUploadSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def perform_create(self, serializer):
        resume = serializer.save()
        AuditService.log_action(
            self.request.user, "Resume uploaded", "resume", resume.id,
            {"filename": resume.filename, "file_size": resume.file_size}
        )


class ResumeListView(generics.ListAPIView):
    """List user's resumes."""
    serializer_class = ResumeListSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).select_related("analysis")


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete a resume."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ResumeDetailSerializer
        return ResumeUploadSerializer

    def perform_destroy(self, instance):
        filename = instance.filename
        instance.delete()
        AuditService.log_action(
            self.request.user, "Resume deleted", "resume", instance.id,
            {"filename": filename}
        )


# ========================================================
# Resume Analysis Views
# ========================================================

class AnalyzeResumeView(generics.GenericAPIView):
    """Analyze a resume."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        """Analyze resume by ID."""
        # Handle both direct id path parameter and body parameter
        resume_id = request.data.get("resume_id") or request.query_params.get("resume_id")
        
        if not resume_id:
            return Response(
                {"error": "resume_id is required in request body or query params"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            resume_id = int(resume_id)
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except (ValueError, TypeError):
            return Response(
                {"error": "resume_id must be an integer"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delete existing analysis if present
        if hasattr(resume, "analysis"):
            resume.analysis.delete()

        # Create analysis record
        analysis = ResumeAnalysis.objects.create(
            resume=resume,
            overall_score=0,
            status="analyzing"
        )

        try:
            # Extract text from file
            file_path = resume.file.path
            extracted_text = TextExtractor.extract_text(file_path, resume.filename)

            # Analyze resume using AI
            analyzer = ResumeAnalyzerService()
            analysis_result = analyzer.analyze_resume(extracted_text)

            # Update analysis with scores
            analysis.overall_score = analysis_result.get("overall_score", 75)
            analysis.format_score = analysis_result.get("format_score", 75)
            analysis.keywords_score = analysis_result.get("keywords_score", 75)
            analysis.experience_score = analysis_result.get("experience_score", 75)
            analysis.education_score = analysis_result.get("education_score", 75)
            analysis.impact_score = analysis_result.get("impact_score", 75)
            analysis.feedback = analysis_result.get("feedback", "Analysis complete")
            analysis.suggestions = analysis_result.get("suggestions", [])
            analysis.extracted_text = extracted_text
            analysis.status = "completed"
            analysis.save()

            # Create skill records
            for skill_data in analysis_result.get("extracted_skills", []):
                Skill.objects.create(
                    analysis=analysis,
                    name=skill_data.get("name"),
                    level=skill_data.get("level", "intermediate")
                )

            AuditService.log_action(
                request.user, "Resume analyzed", "analysis", analysis.id,
                {"resume_id": resume.id, "score": analysis.overall_score}
            )

            return Response(
                ResumeAnalysisDetailSerializer(analysis).data,
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            analysis.status = "failed"
            analysis.feedback = f"Analysis failed: {str(e)}"
            analysis.save()
            logger.error(f"Error analyzing resume: {str(e)}")
            return Response(
                {"error": f"Analysis failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResumeAnalysisDetailView(generics.RetrieveAPIView):
    """Get analysis details for a resume."""
    serializer_class = ResumeAnalysisDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_object(self):
        resume_id = self.kwargs.get("resume_id")
        resume = get_object_or_404(Resume, id=resume_id, user=self.request.user)
        return get_object_or_404(ResumeAnalysis, resume=resume)


# ========================================================
# Skill Views
# ========================================================

class SkillListView(generics.ListAPIView):
    """List skills from user's latest analysis."""
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        resume_id = self.kwargs.get("resume_id")
        resume = get_object_or_404(Resume, id=resume_id, user=self.request.user)
        return Skill.objects.filter(analysis__resume=resume)


# ========================================================
# Job Description Views
# ========================================================

class JobDescriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for JobDescription."""
    queryset = JobDescription.objects.all()
    serializer_class = JobDescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        title = self.request.query_params.get("title")
        company = self.request.query_params.get("company")

        queryset = JobDescription.objects.all()

        if title:
            queryset = queryset.filter(title__icontains=title)
        if company:
            queryset = queryset.filter(company__icontains=company)

        return queryset


# ========================================================
# Job Matching Views
# ========================================================

class JobMatchingView(generics.ListAPIView):
    """Match resume against job descriptions."""
    serializer_class = JobMatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        resume_id = self.kwargs.get("resume_id")
        resume = get_object_or_404(Resume, id=resume_id, user=self.request.user)
        analysis = get_object_or_404(ResumeAnalysis, resume=resume)

        # Get or create matches
        jobs = JobDescription.objects.all()
        resume_skills = list(analysis.skills.values_list("name", flat=True))

        for job in jobs:
            if not JobMatch.objects.filter(analysis=analysis, job=job).exists():
                match_score, matched, missing = JobMatchingService.calculate_match_score(
                    [{"name": s} for s in resume_skills],
                    job.required_skills
                )
                JobMatch.objects.create(
                    analysis=analysis,
                    job=job,
                    match_score=match_score,
                    matched_skills=matched,
                    missing_skills=missing
                )

        return JobMatch.objects.filter(analysis=analysis).select_related("job").order_by("-match_score")


# ========================================================
# Dashboard Stats Views
# ========================================================

class DashboardStatsView(generics.GenericAPIView):
    """Get dashboard statistics for user."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        resumes = Resume.objects.filter(user=request.user)
        analyses = ResumeAnalysis.objects.filter(resume__user=request.user)

        # Calculate stats
        total_uploads = resumes.count()
        avg_score = analyses.aggregate(avg=Avg("overall_score"))["avg"] or 0
        total_jobs_matched = JobMatch.objects.filter(
            analysis__resume__user=request.user
        ).count()

        # Get in-demand skills
        in_demand_skills = Skill.objects.filter(
            analysis__resume__user=request.user,
            is_in_demand=True
        ).values_list("name", flat=True).distinct().count()

        return Response({
            "total_uploads": total_uploads,
            "avg_ats_score": round(avg_score, 1),
            "jobs_matched": total_jobs_matched,
            "in_demand_skills": in_demand_skills
        })


# ========================================================
# Template Views
# ========================================================

class AnalysisTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AnalysisTemplate."""
    queryset = AnalysisTemplate.objects.all()
    serializer_class = AnalysisTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        category = self.request.query_params.get("category")
        if category:
            return AnalysisTemplate.objects.filter(category=category)
        return AnalysisTemplate.objects.all()


# ========================================================
# Audit Log Views
# ========================================================

class AuditLogListView(generics.ListAPIView):
    """List user's audit logs."""
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        return AuditLog.objects.filter(user=self.request.user).order_by("-created_at")


# ========================================================
# Health Check View
# ========================================================

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({"status": "healthy", "message": "API is running"})

