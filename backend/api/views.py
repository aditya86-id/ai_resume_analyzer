import os
import logging
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count
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
from rest_framework.decorators import action

from .services import TextExtractor, ResumeAnalyzerService, JobMatchingService, AuditService, NLPService

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
        
        # Auto-analyze the resume after upload
        try:
            # Delete existing analysis if present
            if hasattr(resume, "analysis") and resume.analysis:
                resume.analysis.delete()

            # Create analysis record
            analysis = ResumeAnalysis.objects.create(
                resume=resume,
                overall_score=0,
                status="analyzing"
            )

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
            analysis.ai_suggestions = analysis_result.get("ai_suggestions", [])
            analysis.ats_analysis = analysis_result.get("ats_analysis", {})
            analysis.pattern_issues = analysis_result.get("pattern_issues", {})
            analysis.strengths = analysis_result.get("strengths", [])
            analysis.resume_quality_summary = analysis_result.get("resume_quality_summary", "")
            analysis.career_stage = analysis_result.get("career_stage", "mid")
            analysis.industry_match = analysis_result.get("industry_match", "")
            analysis.ats_recommendations = analysis_result.get("ats_recommendations", [])
            analysis.extracted_text = extracted_text
            analysis.status = "completed"
            analysis.save()

            AuditService.log_action(
                self.request.user, "Resume analyzed", "resume", resume.id,
                {"scores": {
                    "overall": analysis.overall_score,
                    "format": analysis.format_score,
                    "keywords": analysis.keywords_score
                }}
            )
        except Exception as e:
            # Log error but don't fail the upload
            print(f"Error analyzing resume {resume.id}: {str(e)}")
            AuditService.log_action(
                self.request.user, "Resume analysis failed", "resume", resume.id,
                {"error": str(e)}
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
            
            # Save AI suggestions and analysis details
            analysis.ai_suggestions = analysis_result.get("ai_suggestions", [])
            analysis.ats_analysis = analysis_result.get("ats_analysis", {})
            analysis.pattern_issues = analysis_result.get("pattern_issues", {})
            analysis.strengths = analysis_result.get("strengths", [])
            analysis.resume_quality_summary = analysis_result.get("resume_quality_summary", "")
            analysis.career_stage = analysis_result.get("career_stage", "mid")
            analysis.industry_match = analysis_result.get("industry_match", "")
            analysis.ats_recommendations = analysis_result.get("ats_recommendations", [])
            
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
    """ViewSet for JobDescription with NLP analysis."""
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
    
    def perform_create(self, serializer):
        """Analyze job description with NLP before saving."""
        job = serializer.save()
        self._analyze_job_description(job)
        AuditService.log_action(
            self.request.user, "Job description created", "job", job.id,
            {"title": job.title, "company": job.company}
        )
    
    def perform_update(self, serializer):
        """Re-analyze job description when updated."""
        job = serializer.save()
        self._analyze_job_description(job)
        AuditService.log_action(
            self.request.user, "Job description updated", "job", job.id,
            {"title": job.title}
        )
    
    @staticmethod
    def _analyze_job_description(job):
        """Perform NLP analysis on job description."""
        try:
            job_text = f"{job.title} {job.description}"
            analysis = NLPService.analyze_job_description(job_text)
            
            # Update job with analysis results
            job.extracted_skills = analysis.get('extracted_skills', [])
            job.experience_level = analysis.get('experience_level', 'mid')
            job.skill_categories = analysis.get('skill_categories', {})
            job.requirements_summary = analysis.get('requirements_summary', '')
            job.nlp_analysis = analysis
            
            # Also update required_skills if not provided
            if not job.required_skills and job.extracted_skills:
                job.required_skills = [s['name'] for s in job.extracted_skills]
            
            job.save()
            logger.info(f"Job {job.id} analyzed with NLP successfully")
        except Exception as e:
            logger.error(f"Error analyzing job description {job.id}: {str(e)}")
            # Continue without NLP analysis if there's an error
    
    @action(detail=False, methods=['post'])
    def analyze(self, request):
        """Analyze a job description and extract skills."""
        job_description = request.data.get('description')
        job_title = request.data.get('title', 'Job Posting')
        
        if not job_description:
            return Response(
                {'error': 'Job description is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            job_text = f"{job_title} {job_description}"
            analysis = NLPService.analyze_job_description(job_text)
            
            return Response({
                'status': 'success',
                'analysis': analysis
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def match_resume(self, request, pk=None):
        """Match a resume to this job description."""
        resume_id = request.data.get('resume_id')
        
        if not resume_id:
            return Response(
                {'error': 'resume_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            resume = get_object_or_404(Resume, id=resume_id, user=request.user)
            analysis = get_object_or_404(ResumeAnalysis, resume=resume)
            job = self.get_object()
            
            # Check if match already exists
            match, created = JobMatch.objects.get_or_create(
                analysis=analysis,
                job=job
            )
            
            if created:
                # Perform NLP-based matching
                result = JobMatchingService.nlp_match_score(analysis, job)
                match.match_score = result['match_score']
                match.matched_skills = result['matched_skills']
                match.missing_skills = result['missing_skills']
                match.match_details = result.get('match_details', {})
                
                # Set match quality
                if match.match_score >= 80:
                    match.match_quality = 'excellent'
                elif match.match_score >= 60:
                    match.match_quality = 'good'
                elif match.match_score >= 40:
                    match.match_quality = 'fair'
                else:
                    match.match_quality = 'poor'
                
                match.save()
            
            from .serializers import JobMatchDetailSerializer
            return Response(
                JobMatchDetailSerializer(match).data,
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            logger.error(f"Error matching resume to job: {str(e)}")
            return Response(
                {'error': f'Matching failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ========================================================
# Job Matching Views
# ========================================================

class JobMatchingView(generics.ListAPIView):
    """Match resume against job descriptions using NLP."""
    serializer_class = JobMatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        resume_id = self.kwargs.get("resume_id")
        resume = get_object_or_404(Resume, id=resume_id, user=self.request.user)
        analysis = get_object_or_404(ResumeAnalysis, resume=resume)

        # Get or create matches using NLP-based matching
        jobs = JobDescription.objects.all()

        for job in jobs:
            if not JobMatch.objects.filter(analysis=analysis, job=job).exists():
                try:
                    # Use NLP-based matching
                    result = JobMatchingService.nlp_match_score(analysis, job)
                    match = JobMatch.objects.create(
                        analysis=analysis,
                        job=job,
                        match_score=result['match_score'],
                        matched_skills=result['matched_skills'],
                        missing_skills=result['missing_skills'],
                        match_details=result.get('match_details', {})
                    )
                    
                    # Set match quality
                    if match.match_score >= 80:
                        match.match_quality = 'excellent'
                    elif match.match_score >= 60:
                        match.match_quality = 'good'
                    elif match.match_score >= 40:
                        match.match_quality = 'fair'
                    else:
                        match.match_quality = 'poor'
                    
                    match.save()
                except Exception as e:
                    logger.error(f"Error creating job match: {str(e)}")
                    # Fall back to basic matching if NLP fails
                    resume_skills = list(analysis.skills.values_list("name", flat=True))
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
    """Get comprehensive dashboard statistics for user."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user
        resumes = Resume.objects.filter(user=user)
        analyses = ResumeAnalysis.objects.filter(resume__user=user)
        job_matches = JobMatch.objects.filter(analysis__resume__user=user)

        # Calculate core stats
        total_uploads = resumes.count()
        avg_score = analyses.aggregate(avg=Avg("overall_score"))["avg"] or 0
        total_jobs_matched = job_matches.count()

        # Get in-demand skills
        in_demand_skills = Skill.objects.filter(
            analysis__resume__user=user,
            is_in_demand=True
        ).values("name").annotate(count=Count("id")).order_by("-count")[:10]

        # Get score breakdown
        format_avg = analyses.aggregate(avg=Avg("format_score"))["avg"] or 0
        keywords_avg = analyses.aggregate(avg=Avg("keywords_score"))["avg"] or 0
        experience_avg = analyses.aggregate(avg=Avg("experience_score"))["avg"] or 0
        education_avg = analyses.aggregate(avg=Avg("education_score"))["avg"] or 0
        impact_avg = analyses.aggregate(avg=Avg("impact_score"))["avg"] or 0

        # Get top job matches (best matches for resumes)
        top_matches = job_matches.select_related("job", "analysis__resume").order_by("-match_score")[:5]
        
        top_matches_data = []
        for match in top_matches:
            top_matches_data.append({
                "id": match.id,
                "job_title": match.job.title,
                "company": match.job.company,
                "match_score": round(match.match_score, 1),
                "match_quality": match.match_quality,
                "resume_name": match.analysis.resume.filename,
                "matched_skills_count": len(match.matched_skills),
                "missing_skills_count": len(match.missing_skills),
                "missing_skills": match.missing_skills[:3],  # Top 3 missing skills
            })

        # Get career insights from recent analyses
        latest_analysis = analyses.order_by("-created_at").first()
        career_insights = {
            "career_stage": latest_analysis.career_stage if latest_analysis else "mid",
            "industry_match": latest_analysis.industry_match if latest_analysis else "General",
            "strengths": latest_analysis.strengths[:3] if latest_analysis else [],
            "skill_count": Skill.objects.filter(
                analysis__resume__user=user
            ).values("name").distinct().count(),
        }

        # Get skill distribution
        skill_distribution = {}
        skills = Skill.objects.filter(analysis__resume__user=user)
        for skill in skills:
            skill_distribution[skill.name] = skill_distribution.get(skill.name, 0) + 1

        top_skills = sorted(skill_distribution.items(), key=lambda x: x[1], reverse=True)[:8]

        # Calculate improvement opportunities
        improvement_opportunities = []
        if format_avg < 70:
            improvement_opportunities.append({
                "title": "Improve Resume Formatting",
                "description": "Your formatting score is below target. Focus on consistent fonts and spacing.",
                "impact": "high"
            })
        if keywords_avg < 70:
            improvement_opportunities.append({
                "title": "Add Industry Keywords",
                "description": "Include more technical terms and industry-specific language to improve ATS compatibility.",
                "impact": "high"
            })
        if impact_avg < 70:
            improvement_opportunities.append({
                "title": "Quantify Achievements",
                "description": "Add metrics and percentages to your accomplishments for stronger impact.",
                "impact": "medium"
            })

        # Get matching success rate
        if total_jobs_matched > 0:
            excellent_matches = job_matches.filter(match_quality="excellent").count()
            good_matches = job_matches.filter(match_quality="good").count()
            match_success_rate = round((excellent_matches + good_matches) / total_jobs_matched * 100, 1)
        else:
            match_success_rate = 0

        return Response({
            # Core Stats
            "total_uploads": total_uploads,
            "avg_ats_score": round(avg_score, 1),
            "jobs_matched": total_jobs_matched,
            
            # Score Breakdown
            "score_breakdown": {
                "format": round(format_avg, 1),
                "keywords": round(keywords_avg, 1),
                "experience": round(experience_avg, 1),
                "education": round(education_avg, 1),
                "impact": round(impact_avg, 1),
            },
            
            # Top Matches
            "top_matches": top_matches_data,
            "match_success_rate": match_success_rate,
            
            # In-demand Skills
            "in_demand_skills": [
                {"name": skill["name"], "count": skill["count"]}
                for skill in in_demand_skills
            ],
            
            # Top Skills
            "top_skills": [
                {"name": name, "count": count}
                for name, count in top_skills
            ],
            
            # Career Insights
            "career_insights": career_insights,
            
            # Improvement Opportunities
            "improvement_opportunities": improvement_opportunities,
            
            # Status
            "total_resumes": total_uploads,
            "analyzed_resumes": analyses.count(),
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

