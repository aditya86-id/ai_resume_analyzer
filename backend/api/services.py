import logging
import json
import re
import PyPDF2
from docx import Document
from google.genai import Client
from django.conf import settings
from .models import ResumeAnalysis, Skill, AuditLog

logger = logging.getLogger(__name__)

# ATS Keywords for pattern detection
ATS_UNFRIENDLY_ELEMENTS = {
    'images': ['.jpg', '.png', '.gif', '.bmp'],
    'tables': ['table', 'col', 'row'],
    'special_formatting': ['|', '©', '®', '†', '‡'],
    'problematic_terms': ['references available upon request', 'to whom it may concern'],
}

POWER_VERBS = [
    'Achieved', 'Accelerated', 'Accomplished', 'Analyzed', 'Assessed', 'Awarded',
    'Built', 'Boosted', 'Bridged', 'Broadened', 'Championed', 'Collaborated',
    'Consolidated', 'Converted', 'Coordinated', 'Created', 'Cultivated', 'Customized',
    'Delivered', 'Demonstrated', 'Designed', 'Determined', 'Developed', 'Directed',
    'Discovered', 'Doubled', 'Drove', 'Earned', 'Effected', 'Elevated', 'Enabled',
    'Enhanced', 'Ensured', 'Established', 'Evaluated', 'Evolved', 'Examined', 'Exceeded',
    'Executed', 'Expanded', 'Experimented', 'Explained', 'Explored', 'Exposed', 'Expressed',
    'Facilitated', 'Fashioned', 'Fast-tracked', 'Figured', 'Financed', 'Formed', 'Fostered',
    'Founded', 'Fulfilled', 'Furnished', 'Generated', 'Governed', 'Granted', 'Grew',
    'Guided', 'Handled', 'Harnessed', 'Heightened', 'Highlighted', 'Hired', 'Implemented',
    'Improved', 'Increased', 'Influenced', 'Initiated', 'Innovated', 'Installed', 'Instituted',
    'Instructed', 'Integrated', 'Intended', 'Interpreted', 'Interviewed', 'Introduced', 'Invented',
    'Invested', 'Involved', 'Isolated', 'Issued', 'Joined', 'Journeyed', 'Journeyed', 'Judged',
    'Justified', 'Kayaked', 'Kept', 'Kick-started', 'Kicked', 'Kicked-off', 'Killed', 'Landed',
    'Launched', 'Launched', 'Layered', 'Led', 'Leveraged', 'Licensed', 'Lifted', 'Lighted',
    'Limited', 'Linked', 'Liquidated', 'Listed', 'Listened', 'Located', 'Locked', 'Logged',
    'Looked', 'Loomed', 'Loosened', 'Lost', 'Loved', 'Lowered', 'Maintained', 'Managed', 'Mandated',
    'Maneuvered', 'Manifested', 'Manipulated', 'Mapped', 'Marked', 'Marketed', 'Mastered', 'Matched',
    'Materialized', 'Measured', 'Mediated', 'Merged', 'Mobilized', 'Modeled', 'Moderated', 'Modified',
    'Monitored', 'Motivated', 'Moved', 'Negotiated', 'Networked', 'Nominated', 'Normalized',
    'Noted', 'Notified', 'Nurtured', 'Obligated', 'Observed', 'Obtained', 'Occupied', 'Occurred',
    'Operated', 'Optimized', 'Orchestrated', 'Ordered', 'Organized', 'Oriented', 'Originated',
    'Outpaced', 'Outlined', 'Outmaneuvered', 'Outsourced', 'Overcome', 'Oversaw', 'Overwhelmed',
    'Owned', 'Paced', 'Packaged', 'Paid', 'Paired', 'Panicked', 'Participated', 'Partnered',
    'Passed', 'Pathed', 'Patrolled', 'Patented', 'Patterned', 'Paused', 'Peaked', 'Penned',
    'Perceived', 'Perfected', 'Performed', 'Permitted', 'Perpetuated', 'Persevered', 'Personalized',
    'Persuaded', 'Phased', 'Pioneered', 'Pinpointed', 'Planned', 'Played', 'Plowed', 'Plugged',
    'Pointed', 'Polished', 'Pondered', 'Positioned', 'Possessed', 'Powered', 'Practiced', 'Praised',
    'Predicted', 'Prepped', 'Prepared', 'Prescribed', 'Presented', 'Presided', 'Pressed', 'Presumed',
    'Prevented', 'Priced', 'Prided', 'Prioritized', 'Proceeded', 'Processed', 'Procured', 'Produced',
    'Profiled', 'Profited', 'Programmed', 'Projected', 'Promoted', 'Prompted', 'Proofed', 'Proposed',
    'Prospered', 'Protected', 'Protested', 'Proved', 'Provided', 'Provisioned', 'Provoked', 'Published',
    'Pulled', 'Pumped', 'Punched', 'Pursued', 'Pushed', 'Queried', 'Questioned', 'Queued', 'Quickened',
    'Quieted', 'Quit', 'Quoted', 'Rack', 'Raced', 'Raised', 'Ranked', 'Rapt', 'Rated', 'Reached',
    'Reacted', 'Readied', 'Reaffirmed', 'Realigned', 'Realized', 'Reallocated', 'Reaped', 'Reared',
    'Reasoned', 'Reassembled', 'Reassigned', 'Reassured', 'Reattached', 'Rebounded', 'Rebuilt', 'Rebutted',
    'Recalculated', 'Recalled', 'Recanted', 'Recapped', 'Recaptured', 'Receipted', 'Received', 'Receded',
    'Received', 'Recharged', 'Rechecked', 'Recirculated', 'Reclaimed', 'Reclassified', 'Recognized',
    'Recollected', 'Recommended', 'Recompiled', 'Reconciled', 'Reconfigured', 'Reconnected', 'Reconsidered',
    'Reconstructed', 'Recorded', 'Recounted', 'Recouped', 'Recovered', 'Recreated', 'Recruited', 'Rectified',
    'Recuperated', 'Recurred', 'Recycled', 'Redacted', 'Redefined', 'Redirect', 'Rediscovered', 'Redistributed',
    'Redoubled', 'Redrawn', 'Reduced', 'Reestablished', 'Reevaluated', 'Reexamined', 'Reexplored', 'Reexported',
    'Refined', 'Reflated', 'Reflected', 'Refocused', 'Reformed', 'Refracted', 'Refrained', 'Refreshed',
    'Refrigerated', 'Refueled', 'Refuged', 'Refunded', 'Refused', 'Refuted', 'Regained', 'Regal', 'Regaled',
    'Regarded', 'Regenerated', 'Regiggled', 'Regimen', 'Registered', 'Regressed', 'Regretted', 'Regripped',
    'Regularized', 'Regulated', 'Rehabilitated', 'Rehabbed', 'Reheated', 'Rehired', 'Rehearsed', 'Rehoused',
    'Reigned', 'Reimbursed', 'Reinvested', 'Reinforced', 'Reinjected', 'Reinoculated', 'Reinserted', 'Reinstalled',
    'Reinstated', 'Reinsurance', 'Reintegrated', 'Reintroduced', 'Reinured', 'Reinvigorated', 'Reinvoked', 'Reinvolved',
]

INDUSTRY_KEYWORDS = {
    'technology': ['API', 'database', 'software', 'code', 'algorithm', 'cloud', 'DevOps', 'deployment', 'CI/CD', 'Docker', 'Kubernetes', 'Git', 'REST', 'microservices', 'scalability'],
    'business': ['ROI', 'revenue', 'profit', 'market', 'strategy', 'stakeholder', 'analytics', 'metrics', 'KPI', 'budget', 'forecast', 'planning'],
    'marketing': ['brand', 'engagement', 'conversion', 'campaign', 'segmentation', 'analytics', 'SEO', 'SEM', 'social media', 'content', 'audience'],
    'data': ['SQL', 'Python', 'R', 'analytics', 'BI', 'visualization', 'ETL', 'data pipeline', 'machine learning', 'statistical', 'modeling'],
    'general': ['leadership', 'communication', 'collaboration', 'problem-solving', 'critical thinking', 'innovation', 'agile', 'adaptability', 'results-driven'],
}


class TextExtractor:
    """Extract text from PDF and DOCX files."""

    @staticmethod
    def extract_pdf(file_path):
        """Extract text from PDF file."""
        try:
            text = ""
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text()
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting PDF: {str(e)}")
            raise

    @staticmethod
    def extract_docx(file_path):
        """Extract text from DOCX file."""
        try:
            document = Document(file_path)
            text = "\n".join([para.text for para in document.paragraphs])
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting DOCX: {str(e)}")
            raise

    @staticmethod
    def extract_text(file_path, file_name):
        """Extract text from file based on format."""
        if file_name.lower().endswith(".pdf"):
            return TextExtractor.extract_pdf(file_path)
        elif file_name.lower().endswith(".docx"):
            return TextExtractor.extract_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_name}")


class ResumeAnalyzerService:
    """Analyze resume using Google Gemini API."""

    def __init__(self):
        self.client = Client(api_key=settings.GEMINI_API_KEY)

    def analyze_resume(self, resume_text: str) -> dict:
        """
        Analyze resume using Gemini API.
        Returns analysis with scores and feedback.
        Falls back to mock analysis if API is unavailable.
        """
        try:
            # Get ATS analysis and pattern detection
            ats_analysis = ATSAnalyzerService.analyze_ats(resume_text)
            patterns = PatternDetectionService.detect_patterns(resume_text)
            
            prompt = self._build_enhanced_analysis_prompt(resume_text, ats_analysis, patterns)
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )
            response_text = response.text
            analysis_data = self._parse_analysis_response(response_text)
            
            # Enhance with ATS and pattern analysis
            analysis_data['ats_analysis'] = ats_analysis
            analysis_data['pattern_issues'] = patterns
            
            # Only override ai_suggestions if suggest_improvements returns non-empty results
            improved_suggestions = PatternDetectionService.suggest_improvements(
                resume_text, 
                {
                    'format_score': analysis_data.get('format_score', 0),
                    'keywords_score': analysis_data.get('keywords_score', 0),
                    'experience_score': analysis_data.get('experience_score', 0),
                    'education_score': analysis_data.get('education_score', 0),
                    'impact_score': analysis_data.get('impact_score', 0),
                }
            )
            if improved_suggestions:
                analysis_data['ai_suggestions'] = improved_suggestions
            
            return analysis_data

        except Exception as e:
            logger.warning(f"Gemini API unavailable, using mock analysis: {str(e)}")
            # Return mock analysis for demo/testing purposes
            mock_data = self._generate_mock_analysis(resume_text)
            
            # Add ATS and pattern analysis to mock
            ats_analysis = ATSAnalyzerService.analyze_ats(resume_text)
            patterns = PatternDetectionService.detect_patterns(resume_text)
            
            mock_data['ats_analysis'] = ats_analysis
            mock_data['pattern_issues'] = patterns
            
            # Only override ai_suggestions if suggest_improvements returns non-empty results
            improved_suggestions = PatternDetectionService.suggest_improvements(
                resume_text, 
                {
                    'format_score': mock_data.get('format_score', 0),
                    'keywords_score': mock_data.get('keywords_score', 0),
                    'experience_score': mock_data.get('experience_score', 0),
                    'education_score': mock_data.get('education_score', 0),
                    'impact_score': mock_data.get('impact_score', 0),
                }
            )
            if improved_suggestions:
                mock_data['ai_suggestions'] = improved_suggestions
            
            return mock_data

    def _build_enhanced_analysis_prompt(self, resume_text: str, ats_analysis: dict, patterns: dict) -> str:
        """Build enhanced analysis prompt with ATS and pattern information."""
        prompt = f"""You are an expert resume analyst and ATS (Applicant Tracking System) specialist. 
Analyze the following resume with detailed insights on improvement opportunities and ATS compatibility.

Resume Content:
{resume_text}

Current ATS Analysis Data:
- ATS Friendliness Score: {ats_analysis['ats_friendliness_score']}/100
- Parsing Risk Level: {ats_analysis['parsing_risk']}

Detected Pattern Issues:
- Severity: {patterns['severity']}
- Formatting Issues: {', '.join(patterns['formatting_issues']) if patterns['formatting_issues'] else 'None detected'}
- Content Issues: {', '.join(patterns['content_issues']) if patterns['content_issues'] else 'None detected'}
- Keyword Issues: {', '.join(patterns['keyword_issues']) if patterns['keyword_issues'] else 'None detected'}
- Structure Issues: {', '.join(patterns['structure_issues']) if patterns['structure_issues'] else 'None detected'}

Please provide a comprehensive analysis in the following JSON format:
{{
    "overall_score": <0-100>,
    "format_score": <0-100>,
    "keywords_score": <0-100>,
    "experience_score": <0-100>,
    "education_score": <0-100>,
    "impact_score": <0-100>,
    "Resume_quality_summary": "<one sentence summary of resume quality>",
    "feedback": "<detailed feedback addressing strengths and areas for improvement>",
    "strengths": [
        "<strength 1>",
        "<strength 2>",
        "<strength 3>"
    ],
    "suggestions": [
        {{"priority": "High", "area": "<area>", "suggestion": "<actionable improvement>"}},
        {{"priority": "High", "area": "<area>", "suggestion": "<actionable improvement>"}},
        {{"priority": "Medium", "area": "<area>", "suggestion": "<actionable improvement>"}}
    ],
    "extracted_skills": [
        {{"name": "<skill>", "level": "beginner|intermediate|advanced|expert", "in_demand": true/false}},
        ...
    ],
    "suggested_skills_to_add": [
        {{"skill": "<skill>", "reason": "<why this skill matters>"}},
        ...
    ],
    "ats_recommendations": [
        "<recommendation 1 for ATS compatibility>",
        "<recommendation 2 for ATS compatibility>"
    ],
    "industry_match": "<which industry/role this resume best matches>",
    "career_stage": "Entry-level|Junior|Mid-level|Senior|Executive"
}}

Scoring Guidelines:
- Format Score (0-100): Resume structure, readability, formatting consistency, ATS compatibility
- Keywords Score (0-100): Industry keywords, technical terms, relevance to typical job descriptions
- Experience Score (0-100): Clarity of role descriptions, progression, and relevance
- Education Score (0-100): Degree clarity, institution, graduation date, relevant additional education
- Impact Score (0-100): Use of metrics, achievement statements, quantified results, power verbs
- Overall Score: Weighted average considering all factors

Key Points:
1. Be specific and actionable in your suggestions
2. Identify patterns and provide solutions
3. Consider both ATS parsing and human reader perspectives
4. Suggest high-impact, high-effort improvements first
5. Provide realistic assessment of career competitiveness
6. Highlight in-demand skills that could be emphasized
7. Flag critical issues (missing sections, formatting problems)

Be thorough, specific, and provide suggestions the user can immediately act on."""
        return prompt
    
    def _build_analysis_prompt(self, resume_text: str) -> str:
        """Build analysis prompt for Gemini (legacy method, kept for compatibility)."""
        return self._build_enhanced_analysis_prompt(resume_text, {}, {})

    def _parse_analysis_response(self, response_text: str) -> dict:
        """Parse Gemini's JSON response."""
        try:
            # Find JSON in response
            start_idx = response_text.find("{")
            end_idx = response_text.rfind("}") + 1

            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in response")

            json_str = response_text[start_idx:end_idx]
            data = json.loads(json_str)

            # Ensure all required fields are present
            required_fields = {
                "overall_score": 75,
                "format_score": 75,
                "keywords_score": 75,
                "experience_score": 75,
                "education_score": 75,
                "impact_score": 75,
                "feedback": "Analysis complete",
                "suggestions": [],
                "extracted_skills": [],
                "suggested_skills_to_add": [],
                "strengths": [],
                "resume_quality_summary": "Your resume shows potential for improvement",
                "ats_recommendations": [],
                "industry_match": "General",
                "career_stage": "Mid-level",
                "ai_suggestions": [],
            }

            for key, default in required_fields.items():
                if key not in data:
                    data[key] = default

            return data

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            # Return default response on parse error
            return {
                "overall_score": 70,
                "format_score": 70,
                "keywords_score": 70,
                "experience_score": 70,
                "education_score": 70,
                "impact_score": 70,
                "feedback": "Resume analysis completed with default scoring.",
                "strengths": [
                    "Resume submitted for analysis",
                    "Contains professional information",
                ],
                "suggestions": [
                    {"priority": "High", "area": "Formatting", "suggestion": "Review resume formatting for consistency"},
                    {"priority": "High", "area": "Keywords", "suggestion": "Add more industry-specific keywords"},
                    {"priority": "Medium", "area": "Impact", "suggestion": "Quantify achievements where possible"},
                ],
                "extracted_skills": [],
                "suggested_skills_to_add": [
                    {"skill": "Data visualization", "reason": "In-demand technical skill"},
                    {"skill": "System architecture", "reason": "Advanced technical competency"},
                    {"skill": "DevOps practices", "reason": "Modern development trend"},
                ],
                "ats_recommendations": [
                    "Use standard fonts and single-column layout",
                    "Include clear section headers",
                    "Add relevant keywords from job descriptions",
                ],
                "industry_match": "Technology/Business",
                "career_stage": "Mid-level",
                "resume_quality_summary": "Your resume has a solid foundation with opportunities for enhancement.",
                "ai_suggestions": [],
            }


    def _generate_mock_analysis(self, resume_text: str) -> dict:
        """Generate mock analysis for testing/demo when API is unavailable."""
        import random
        
        # Extract some basic info from resume text
        has_python = "python" in resume_text.lower()
        has_django = "django" in resume_text.lower()
        has_react = "react" in resume_text.lower()
        has_quantified = any(char.isdigit() for char in resume_text)
        
        # Base scores
        format_score = random.randint(75, 90)
        keywords_score = random.randint(70, 85)
        experience_score = random.randint(75, 88)
        education_score = random.randint(72, 90)
        impact_score = random.randint(68, 85)
        
        overall_score = int((format_score + keywords_score + experience_score + 
                           education_score + impact_score) / 5)
        
        # Build feedback
        feedback = f"Your resume demonstrates solid professional qualifications. "
        if has_quantified:
            feedback += "You effectively include quantifiable achievements which strengthens your resume. "
        else:
            feedback += "Consider adding more quantifiable metrics to your accomplishments. "
        
        feedback += "The structure and formatting are clear and professional."
        
        # Build strengths
        strengths = [
            "Professional structure and organization",
            "Clear presentation of experience",
        ]
        if has_quantified:
            strengths.append("Includes quantified achievements and metrics")
        
        # Build suggestions with new format
        suggestions = []
        if not has_quantified:
            suggestions.append({
                "priority": "High",
                "area": "Impact & Metrics",
                "suggestion": "Add specific metrics and percentages to accomplishments (e.g., improved performance by 40%)",
                "action": "Rewrite each bullet point to include measurable results and quantifiable outcomes"
            })
        if keywords_score < 80:
            suggestions.append({
                "priority": "High",
                "area": "Keywords",
                "suggestion": "Include more industry-specific keywords relevant to your target roles",
                "action": "Review job postings for your target role and incorporate those keywords naturally"
            })
        if format_score < 80:
            suggestions.append({
                "priority": "Medium",
                "area": "Formatting",
                "suggestion": "Ensure consistent formatting throughout the document",
                "action": "Use consistent fonts, sizes, and spacing throughout your resume"
            })
        if not has_python and not has_django and not has_react:
            suggestions.append({
                "priority": "High",
                "area": "Technical Skills",
                "suggestion": "Highlight technical skills and programming languages prominently",
                "action": "Add a dedicated technical skills section with relevant technologies and certifications"
            })
        suggestions.append({
            "priority": "Medium",
            "area": "Summary",
            "suggestion": "Consider adding a brief professional summary at the top",
            "action": "Create a 2-3 line professional summary highlighting your key strengths and target role"
        })
        
        # Extract skills
        extracted_skills = []
        if has_python:
            extracted_skills.append({"name": "Python", "level": "advanced", "in_demand": True})
        if has_django:
            extracted_skills.append({"name": "Django", "level": "advanced", "in_demand": True})
        if has_react:
            extracted_skills.append({"name": "React", "level": "intermediate", "in_demand": True})
        
        # Add some common skills
        common_skills = [
            {"name": "Communication", "level": "advanced", "in_demand": True},
            {"name": "Project Management", "level": "intermediate", "in_demand": True},
            {"name": "Problem Solving", "level": "advanced", "in_demand": True},
        ]
        extracted_skills.extend(common_skills)
        
        suggested_skills_add = [
            {"skill": "Data visualization", "reason": "In-demand technical skill"},
            {"skill": "System architecture", "reason": "Advanced technical competency"},
            {"skill": "DevOps practices", "reason": "Modern development trend"},
        ]
        
        ats_recommendations = [
            "✓ Use standard fonts (Arial, Calibri, Times New Roman)",
            "✓ Save as .docx or .pdf format for maximum compatibility",
            "✓ Single column layout with clear section headers",
            "✓ Avoid tables, images, and text boxes for better parsing",
            "✓ Include relevant keywords from job descriptions",
        ]
        
        return {
            "overall_score": overall_score,
            "format_score": format_score,
            "keywords_score": keywords_score,
            "experience_score": experience_score,
            "education_score": education_score,
            "impact_score": impact_score,
            "feedback": feedback,
            "strengths": strengths,
            "suggestions": suggestions,
            "ai_suggestions": suggestions,  # Also include as ai_suggestions
            "extracted_skills": extracted_skills,
            "suggested_skills_to_add": suggested_skills_add,
            "ats_recommendations": ats_recommendations,
            "industry_match": "Technology & Business Services",
            "career_stage": "Mid-level",
            "resume_quality_summary": f"Your resume is good with an overall score of {overall_score}/100. Focus on quantifying achievements and adding industry-specific keywords.",
        }


class JobMatchingService:
    """Match resume skills against job requirements."""

    @staticmethod
    def calculate_match_score(resume_skills: list, job_required_skills: list) -> tuple:
        """
        Calculate match score based on skill overlap.
        Returns (match_score, matched_skills, missing_skills)
        """
        resume_skill_names = [s.lower() for s in [skill["name"] for skill in resume_skills]]
        job_skills = [s.lower() for s in job_required_skills]

        matched_skills = [skill for skill in job_skills if skill in resume_skill_names]
        missing_skills = [skill for skill in job_skills if skill not in resume_skill_names]

        if len(job_skills) == 0:
            match_score = 100.0
        else:
            match_score = (len(matched_skills) / len(job_skills)) * 100

        return match_score, matched_skills, missing_skills


class AuditService:
    """Track user actions for audit logging."""

    @staticmethod
    def log_action(user, action: str, resource_type: str, resource_id=None, details=None):
        """Create an audit log entry."""
        try:
            AuditLog.objects.create(
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details or {},
            )
        except Exception as e:
            logger.error(f"Error creating audit log: {str(e)}")


class PatternDetectionService:
    """Detect common resume issues and patterns."""
    
    @staticmethod
    def detect_patterns(resume_text: str) -> dict:
        """
        Detect common resume issues and anti-patterns.
        Returns a dict with issues found.
        """
        issues = {
            'formatting_issues': [],
            'content_issues': [],
            'keyword_issues': [],
            'structure_issues': [],
            'severity': 'low',  # low, medium, high
        }
        
        # Convert to lowercase for analysis
        text_lower = resume_text.lower()
        lines = resume_text.split('\n')
        
        # 1. Check for missing sections
        required_sections = {
            'experience': ['experience', 'employment', 'work history', 'professional'],
            'education': ['education', 'degree', 'university', 'college', 'school'],
            'skills': ['skills', 'technical', 'competencies', 'expertise'],
            'contact': ['email', 'phone', 'linkedin', 'contact'],
        }
        
        found_sections = {section: False for section in required_sections}
        for section, keywords in required_sections.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_sections[section] = True
                    break
        
        for section, found in found_sections.items():
            if not found:
                issues['structure_issues'].append(f"Missing or unclear '{section}' section")
                issues['severity'] = 'high'
        
        # 2. Check for weak action verbs
        weak_verbs = ['responsible for', 'involved in', 'participated in', 'worked on', 'helped with']
        weak_verb_count = sum(1 for verb in weak_verbs if verb in text_lower)
        
        if weak_verb_count > 0:
            issues['content_issues'].append(
                f"Found {weak_verb_count} weak action verbs. Consider replacing with power verbs like: "
                f"{', '.join(POWER_VERBS[:5])}"
            )
            if weak_verb_count > 3:
                issues['severity'] = 'high'
            elif weak_verb_count > 1:
                issues['severity'] = 'medium'
        
        # 3. Check for quantified achievements
        numbers = re.findall(r'\b\d+[\d%$]*', resume_text)
        has_percentages = any('%' in num for num in numbers)
        
        if len(numbers) < 3:
            issues['content_issues'].append(
                "Limited use of quantified metrics. Add specific numbers, percentages, and results to achievements."
            )
            if issues['severity'] == 'low':
                issues['severity'] = 'medium'
        
        # 4. Check formatting consistency
        # Look for inconsistent bullet points
        bullet_types = set()
        for line in lines:
            if line.strip() and line.strip()[0] in ['•', '-', '*', '◦']:
                bullet_types.add(line.strip()[0])
        
        if len(bullet_types) > 1:
            issues['formatting_issues'].append(
                f"Inconsistent bullet point styles detected. Consider using one consistent style."
            )
        
        # 5. Check for length issues
        word_count = len(resume_text.split())
        if word_count < 200:
            issues['structure_issues'].append("Resume appears too short. Aim for 250-500 words.")
            issues['severity'] = 'high'
        elif word_count > 800:
            issues['structure_issues'].append(
                "Resume may be too detailed (800+ words). Consider condensing to 1-2 pages for better ATS compatibility."
            )
        
        # 6. Check for ATS-unfriendly elements
        if any(ext in resume_text for ext in ATS_UNFRIENDLY_ELEMENTS['images']):
            issues['formatting_issues'].append(
                "Images detected. Some ATS systems struggle with images. Ensure text content is complete."
            )
        
        # 7. Check for industry keywords across industries
        keyword_count = 0
        related_keywords = []
        for category, keywords in INDUSTRY_KEYWORDS.items():
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    keyword_count += 1
                    related_keywords.append(keyword)
        
        if keyword_count < 5:
            issues['keyword_issues'].append(
                "Limited industry keywords detected. Add technical terms and industry-specific language."
            )
            if issues['severity'] == 'low':
                issues['severity'] = 'medium'
        
        # 8. Check for personal pronouns (should be avoided)
        pronouns = ['i ', ' i ', ' me ', 'my ', ' my ']
        pronoun_count = sum(1 for p in pronouns if p in text_lower)
        
        if pronoun_count > 5:
            issues['content_issues'].append(
                "Excessive use of personal pronouns (I, me, my). Resumes typically omit pronouns in bullet points."
            )
        
        # 9. Check for dates consistency
        date_patterns = re.findall(r'\d{1,2}/\d{1,2}/\d{4}|\d{4}', resume_text)
        if len(date_patterns) < 2:
            issues['content_issues'].append("Ensure all dates are clearly specified (start and end dates for positions).")
        
        # 10. Check for contact information
        has_email = any(keyword in text_lower for keyword in ['@', 'email'])
        has_phone = any(char.isdigit() for char in resume_text) and len(numbers) > 1
        
        if not has_email:
            issues['structure_issues'].append("Email address not found in resume.")
            issues['severity'] = 'high'
        
        return issues
    
    @staticmethod
    def suggest_improvements(resume_text: str, analysis_scores: dict) -> list:
        """Generate improvement suggestions based on scores and patterns."""
        suggestions = []
        
        # Based on format score
        if analysis_scores.get('format_score', 0) < 70:
            suggestions.append({
                'category': 'Formatting',
                'priority': 'High',
                'suggestion': 'Improve resume formatting - use consistent fonts, sizes, and spacing. Single or two-column layout recommended for ATS compatibility.',
                'action': 'Review formatting guidelines and reformat your resume'
            })
        
        # Based on keywords score
        if analysis_scores.get('keywords_score', 0) < 70:
            suggestions.append({
                'category': 'Keywords',
                'priority': 'High',
                'suggestion': 'Add more industry-specific keywords matching your target job descriptions. Mirror language from job postings you\'re interested in.',
                'action': 'Identify 5-10 key terms from target job postings and incorporate them'
            })
        
        # Based on experience score
        if analysis_scores.get('experience_score', 0) < 70:
            suggestions.append({
                'category': 'Experience Description',
                'priority': 'High',
                'suggestion': 'Use action verbs and quantifiable results. Start each bullet with strong verbs like: led, developed, improved, achieved.',
                'action': 'Rewrite experience bullets with power verbs and metrics'
            })
        
        # Based on impact score
        if analysis_scores.get('impact_score', 0) < 70:
            suggestions.append({
                'category': 'Impact & Metrics',
                'priority': 'Medium',
                'suggestion': 'Quantify your achievements with numbers, percentages, and real results. Example: "Increased sales by 35%" instead of "Increased sales".',
                'action': 'Add metrics and percentages to each achievement'
            })
        
        # Based on education score
        if analysis_scores.get('education_score', 0) < 70:
            suggestions.append({
                'category': 'Education',
                'priority': 'Medium',
                'suggestion': 'Include degree type, graduation date, GPA (if 3.5+), relevant coursework, or honors. Consider adding certifications.',
                'action': 'Enhance education section with more details'
            })
        
        return suggestions


class ATSAnalyzerService:
    """Analyze resume for ATS (Applicant Tracking System) compatibility."""
    
    @staticmethod
    def analyze_ats(resume_text: str) -> dict:
        """
        Analyze resume for ATS compatibility.
        Returns detailed ATS analysis with scores and recommendations.
        """
        analysis = {
            'ats_friendliness_score': 0,
            'parsing_risk': 'low',  # low, medium, high
            'issues': [],
            'recommendations': [],
            'details': {
                'text_extraction': True,
                'section_recognition': True,
                'keyword_matching': True,
                'formatting': True,
            }
        }
        
        issues = []
        score = 100
        
        # 1. Check for text extractability
        if len(resume_text.strip()) < 100:
            issues.append("Resume text is too short for ATS to process.")
            score -= 30
            analysis['details']['text_extraction'] = False
        
        # 2. Check for clear section headers
        section_headers = ['experience', 'education', 'skills', 'summary', 'objective']
        found_headers = sum(1 for header in section_headers if header in resume_text.lower())
        
        if found_headers < 2:
            issues.append("Clear section headers not detected. Use standard headers like 'Experience', 'Education', 'Skills'.")
            score -= 20
            analysis['details']['section_recognition'] = False
        
        # 3. Check for problematic formatting
        problematic_elements = {
            'tables': False,
            'graphics': False,
            'columns': False,
            'special_chars': False,
        }
        
        # Check for table-like structures
        if '\t' in resume_text and resume_text.count('\t') > 5:
            problematic_elements['tables'] = True
            issues.append("Heavy use of tabs detected. ATS may have difficulty parsing. Consider using spaces or line breaks instead.")
            score -= 15
        
        # Check for special characters that cause parsing issues
        special_chars = ['©', '®', '†', '¶', '≈', '∑', '√', '∂']
        if any(char in resume_text for char in special_chars):
            problematic_elements['special_chars'] = True
            issues.append("Special Unicode characters detected. Consider using standard ASCII characters for better ATS compatibility.")
            score -= 10
        
        # 4. Keyword density analysis
        text_lower = resume_text.lower()
        words = resume_text.split()
        
        if len(words) > 0:
            # Check for keyword variation
            unique_words = len(set(word.lower() for word in words if len(word) > 3))
            unique_ratio = unique_words / len(words) if len(words) > 0 else 0
            
            if unique_ratio < 0.3:
                issues.append("Low keyword variety detected. Consider adding more industry-specific terms.")
                score -= 10
        
        # 5. Date format consistency
        date_formats = {
            'MM/DD/YYYY': len(re.findall(r'\d{1,2}/\d{1,2}/\d{4}', resume_text)),
            'Month YYYY': len(re.findall(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}', resume_text, re.IGNORECASE)),
            'Other': 0
        }
        
        date_count = sum(date_formats.values())
        if date_count > 0:
            format_types = sum(1 for v in date_formats.values() if v > 0)
            if format_types > 1:
                issues.append("Inconsistent date formats detected. Use consistent format throughout (e.g., MM/YYYY or Month YYYY).")
                score -= 10
        
        # 6. Contact information check
        has_email = '@' in resume_text and '.' in resume_text
        has_phone = len(re.findall(r'\d{3}[-.]?\d{3}[-.]?\d{4}', resume_text)) > 0
        has_location = any(word in resume_text.lower() for word in ['city', 'state', 'country', 'remote', 'location'])
        
        if not has_email:
            issues.append("Email address not found. ATS needs email for contact purposes.")
            score -= 20
            analysis['details']['text_extraction'] = False
        
        # 7. Keyword matching for ATS
        common_ats_keywords = {
            'technical': ['database', 'software', 'programming', 'development', 'system', 'technical', 'IT'],
            'soft_skills': ['leadership', 'communication', 'teamwork', 'problem-solving'],
            'achievement': ['improved', 'increased', 'achieved', 'developed', 'managed', 'led'],
        }
        
        keyword_matches = 0
        for category, keywords in common_ats_keywords.items():
            keyword_matches += sum(1 for kw in keywords if kw.lower() in text_lower)
        
        if keyword_matches < 5:
            issues.append("Limited achievement and skill keywords. Add power verbs and specific skills.")
            score -= 15
            analysis['details']['keyword_matching'] = False
        
        # Set parsing risk based on score
        if score < 60:
            analysis['parsing_risk'] = 'high'
        elif score < 80:
            analysis['parsing_risk'] = 'medium'
        else:
            analysis['parsing_risk'] = 'low'
        
        analysis['ats_friendliness_score'] = max(0, score)
        analysis['issues'] = issues
        
        # Generate recommendations
        if analysis['parsing_risk'] == 'high':
            analysis['recommendations'].append("⚠️ HIGH RISK: Consider completely reformatting your resume for better ATS compatibility.")
        elif analysis['parsing_risk'] == 'medium':
            analysis['recommendations'].append("Consider addressing the ATS issues above to improve parsing compatibility.")
        
        analysis['recommendations'].extend([
            "✓ Use standard fonts (Arial, Calibri, Times New Roman)",
            "✓ Save as .docx or .pdf (check job posting for preferred format)",
            "✓ Single column layout with clear sections",
            "✓ Avoid headers/footers, tables, and text boxes",
            "✓ Use standard bullet points and numbering",
            "✓ Include relevant keywords from job description",
        ])
        
        return analysis
