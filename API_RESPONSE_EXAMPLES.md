# Enhanced API Reference & Response Examples

## Base URL
```
http://localhost:8000/api/
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "date_joined": "2026-03-03T10:30:00Z"
  },
  "token": "abc123xyz789def456",
  "message": "User registered successfully"
}
```

---

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "abc123xyz789def456",
  "message": "Login successful"
}
```

---

## Resume Endpoints

### Upload Resume
```http
POST /api/resumes/upload/
Content-Type: multipart/form-data
Authorization: Token abc123xyz789def456

file: <binary PDF or DOCX file>
```

**Response (201 Created):**
```json
{
  "id": 5,
  "filename": "john_doe_resume.pdf",
  "file": "/media/resumes/2026/03/01/john_doe_resume.pdf",
  "file_size": 45678,
  "uploaded_at": "2026-03-03T10:35:22Z",
  "status": "pending"
}
```

---

### Get All Resumes
```http
GET /api/resumes/?page=1&page_size=10
Authorization: Token abc123xyz789def456
```

**Response (200 OK):**
```json
{
  "count": 23,
  "next": "http://localhost:8000/api/resumes/?page=2",
  "previous": null,
  "results": [
    {
      "id": 5,
      "filename": "john_doe_resume.pdf",
      "file_size": 45678,
      "uploaded_at": "2026-03-03T10:35:22Z",
      "status": "completed"
    }
  ]
}
```

---

## Analysis Endpoints

### Get Resume Analysis (NEW - Enhanced)
```http
GET /api/resumes/{resumeId}/analysis/
Authorization: Token abc123xyz789def456
```

**Response (200 OK):**
```json
{
  "id": 5,
  "overall_score": 78,
  "format_score": 82,
  "keywords_score": 75,
  "experience_score": 80,
  "education_score": 72,
  "impact_score": 78,
  
  "resume_quality_summary": "Your resume demonstrates strong professional presentation with clear experience descriptions. Consider adding more quantifiable metrics and industry-specific keywords to strengthen your candidacy.",
  
  "feedback": "Your resume shows solid professional qualifications with good structure and formatting. The experience section is well-organized and clearly presented. Education details are appropriate. To improve further, focus on adding more specific metrics to your achievements (percentages, dollar amounts, quantities), expanding your use of industry-specific keywords relevant to your target roles, and ensuring consistent formatting throughout.",
  
  "strengths": [
    "Professional structure and clear organization",
    "Well-articulated experience descriptions with action verbs",
    "Appropriate education section with relevant details",
    "Good formatting consistency and readability"
  ],
  
  "suggestions": [
    {
      "priority": "High",
      "area": "Impact & Metrics",
      "suggestion": "Add quantifiable metrics to your achievements. For example, instead of 'improved system efficiency', specify 'improved system efficiency by 35%, reducing load times from 8s to 5s'"
    },
    {
      "priority": "High",
      "area": "Keywords",
      "suggestion": "Increase the frequency of industry-specific keywords. Key areas to strengthen: cloud infrastructure (AWS, Azure), DevOps practices, containerization (Docker, Kubernetes), and modern development frameworks"
    },
    {
      "priority": "Medium",
      "area": "Summary Section",
      "suggestion": "Consider adding a professional summary at the top of your resume to immediately highlight your key qualifications and career goals"
    },
    {
      "priority": "Medium",
      "area": "Skills Organization",
      "suggestion": "Group skills by category (Technical, Leadership, Languages) for better ATS parsing and readability"
    }
  ],
  
  "extracted_skills": [
    {
      "name": "Python",
      "level": "advanced",
      "in_demand": true,
      "match_score": 95
    },
    {
      "name": "Django",
      "level": "advanced",
      "in_demand": true,
      "match_score": 90
    },
    {
      "name": "PostgreSQL",
      "level": "intermediate",
      "in_demand": true,
      "match_score": 85
    },
    {
      "name": "REST API Design",
      "level": "advanced",
      "in_demand": true,
      "match_score": 88
    },
    {
      "name": "Git/Version Control",
      "level": "advanced",
      "in_demand": true,
      "match_score": 92
    },
    {
      "name": "Project Management",
      "level": "intermediate",
      "in_demand": false,
      "match_score": 75
    }
  ],
  
  "suggested_skills_to_add": [
    {
      "skill": "Docker",
      "reason": "Essential modern DevOps skill, highly in-demand for backend development roles"
    },
    {
      "skill": "Kubernetes",
      "reason": "Advanced orchestration skill, valuable for senior backend positions"
    },
    {
      "skill": "AWS (or similar cloud platform)",
      "reason": "Cloud infrastructure skills are critical for modern software development"
    },
    {
      "skill": "GraphQL",
      "reason": "Modern API development skill, increasingly preferred over traditional REST"
    },
    {
      "skill": "Redis",
      "reason": "Caching and session management skill, improves application performance"
    }
  ],
  
  "ats_analysis": {
    "ats_friendliness_score": 85,
    "parsing_risk": "low",
    "issues": [],
    "recommendations": [
      "✓ Use standard fonts (Arial, Calibri, Times New Roman)",
      "✓ Save as .docx or .pdf (check job posting for preferred format)",
      "✓ Single column layout with clear sections",
      "✓ Avoid headers/footers, tables, and text boxes",
      "✓ Use standard bullet points and numbering",
      "✓ Include relevant keywords from job description"
    ],
    "details": {
      "text_extraction": true,
      "section_recognition": true,
      "keyword_matching": true,
      "formatting": true
    }
  },
  
  "pattern_issues": {
    "formatting_issues": [],
    "content_issues": [
      "Consider replacing 2 instances of weak action verbs with more powerful alternatives"
    ],
    "keyword_issues": [
      "Limited use of DevOps-related keywords. Consider adding: CI/CD, containerization, infrastructure-as-code"
    ],
    "structure_issues": [],
    "severity": "low"
  },
  
  "ai_suggestions": [
    {
      "category": "Formatting",
      "priority": "High",
      "suggestion": "Your resume formatting is generally good with ATS compatibility score of 85/100. No critical formatting changes needed, but consider reviewing the specific recommendations above.",
      "action": "Review formatting recommendations and make targeted improvements"
    },
    {
      "category": "Keywords",
      "priority": "High",
      "suggestion": "Your resume could benefit from more technical keywords. Current keywords score: 75/100. Focus on cloud technologies, DevOps tools, and modern frameworks.",
      "action": "Research job descriptions in your target roles and add relevant keywords"
    },
    {
      "category": "Experience Description",
      "priority": "High",
      "suggestion": "Experience section (80/100) is well-written but could be strengthened with more specific metrics and quantifiable outcomes.",
      "action": "Review each bullet point and add numbers, percentages, or concrete results"
    },
    {
      "category": "Impact & Metrics",
      "priority": "Medium",
      "suggestion": "Impact score is 78/100. Each achievement should start with an action verb and include quantifiable results.",
      "action": "Add metrics to at least 3 more achievements in your experience"
    }
  ],
  
  "industry_match": "Software Development / Backend Engineering",
  "career_stage": "Mid-level",
  
  "ats_recommendations": [
    "✓ Excellent ATS compatibility (85/100)",
    "✓ Text is easily extractable and parsable",
    "✓ Clear section headers detected",
    "✓ Formatting is ATS-friendly",
    "✓ No problematic special characters",
    "✓ Contains sufficient keywords for parsing"
  ],
  
  "status": "completed",
  "created_at": "2026-03-03T10:35:45Z",
  "updated_at": "2026-03-03T10:36:15Z"
}
```

---

## Skills Endpoints

### Get Resume Skills
```http
GET /api/resumes/{resumeId}/skills/
Authorization: Token abc123xyz789def456
```

**Response (200 OK):**
```json
{
  "count": 6,
  "results": [
    {
      "id": 1,
      "name": "Python",
      "level": "advanced",
      "is_in_demand": true,
      "match_score": 95
    },
    {
      "id": 2,
      "name": "Django",
      "level": "advanced",
      "is_in_demand": true,
      "match_score": 90
    },
    {
      "id": 3,
      "name": "PostgreSQL",
      "level": "intermediate",
      "is_in_demand": true,
      "match_score": 85
    }
  ]
}
```

---

## Job Matching Endpoints

### Get Job Matches
```http
GET /api/resumes/{resumeId}/matching/
Authorization: Token abc123xyz789def456
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "analysis": 5,
    "job": {
      "id": 10,
      "title": "Senior Backend Developer",
      "company": "TechCorp",
      "location": "Remote",
      "salary_min": 100000,
      "salary_max": 150000
    },
    "match_score": 92.5,
    "matched_skills": [
      "Python",
      "Django",
      "PostgreSQL",
      "REST API Design",
      "Git"
    ],
    "missing_skills": [
      "Docker",
      "Kubernetes",
      "AWS"
    ],
    "created_at": "2026-03-03T10:36:20Z"
  },
  {
    "id": 2,
    "analysis": 5,
    "job": {
      "id": 11,
      "title": "Full Stack Developer",
      "company": "StartupXYZ",
      "location": "San Francisco, CA",
      "salary_min": 80000,
      "salary_max": 120000
    },
    "match_score": 78.3,
    "matched_skills": [
      "Python",
      "Django",
      "REST API Design"
    ],
    "missing_skills": [
      "React",
      "Node.js",
      "Docker",
      "AWS"
    ],
    "created_at": "2026-03-03T10:36:25Z"
  }
]
```

---

## Error Responses

### 400 Bad Request - Missing File
```json
{
  "error": "No file provided",
  "status": 400
}
```

### 400 Bad Request - Invalid File Type
```json
{
  "error": "Invalid file type. Allowed: PDF, DOCX",
  "status": 400
}
```

### 400 Bad Request - File Too Large
```json
{
  "error": "File too large (max 10MB)",
  "status": 400
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 429 Too Many Requests (Rate Limited)
```json
{
  "detail": "Request was throttled. Expected available in 3600 seconds."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "status": 500,
  "trace_id": "abc123xyz"
}
```

---

## Response Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request (resource created) |
| 202 | Accepted | Request accepted for async processing |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected server error |
| 503 | Service Unavailable | Temporary service issue |

---

## Rate Limiting

**Current Limits:**
- Anonymous users: 100 requests/day
- Authenticated users: 1,000 requests/day
- Resume uploads: 5 per hour

**Headers Return:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1646390400
```

---

## Pagination

**Query Parameters:**
```
?page=1          # Page number (default: 1)
?page_size=10    # Items per page (default: 10, max: 100)
```

**Response Format:**
```json
{
  "count": 150,
  "next": "http://api.example.com/resumes/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Filtering & Sorting

**Filter Parameters:**
```
?status=completed
?user=john
?created_after=2026-03-01
?created_before=2026-03-05
```

**Sort Parameters:**
```
?ordering=-created_at    # Newest first
?ordering=overall_score  # Lowest score first
```

---

## Webhook Events (Future)

Processing status updates via webhooks:

```json
{
  "event": "resume.analysis.completed",
  "data": {
    "resume_id": 5,
    "overall_score": 78,
    "status": "completed"
  },
  "timestamp": "2026-03-03T10:36:15Z"
}
```

---

## SDK Examples

### Python Client
```python
from resume_analyzer import ResumeAnalyzerClient

client = ResumeAnalyzerClient(token='abc123xyz789def456')

# Upload resume
resume = client.upload_resume('path/to/resume.pdf')

# Get analysis
analysis = client.get_analysis(resume['id'])
print(f"Score: {analysis['overall_score']}")
print(f"ATS Score: {analysis['ats_analysis']['ats_friendliness_score']}")

# Get job matches
matches = client.get_matches(resume['id'])
for match in matches:
    print(f"{match['job']['title']} - {match['match_score']}% match")
```

### JavaScript/Node.js Client
```javascript
import { ResumeAnalyzerClient } from 'resume-analyzer-sdk';

const client = new ResumeAnalyzerClient({
  token: 'abc123xyz789def456'
});

// Upload resume
const resume = await client.uploadResume(file);

// Get analysis
const analysis = await client.getAnalysis(resume.id);
console.log(`Score: ${analysis.overall_score}`);
console.log(`ATS Score: ${analysis.ats_analysis.ats_friendliness_score}`);

// Get suggestions
analysis.ai_suggestions.forEach(suggestion => {
  console.log(`${suggestion.priority}: ${suggestion.suggestion}`);
});
```

---

## Best Practices

1. **Always include Authorization header:**
   ```
   Authorization: Token your_token_here
   ```

2. **Handle errors gracefully:**
   ```javascript
   try {
     const analysis = await api.getAnalysis(resumeId);
   } catch (error) {
     if (error.status === 401) {
       // Re-authenticate
     } else if (error.status === 429) {
       // Retry after delay
     }
   }
   ```

3. **Implement pagination for list endpoints:**
   ```
   GET /api/resumes/?page=1&page_size=20
   ```

4. **Cache frequently accessed data:**
   - Cache analysis results for 1 hour
   - Cache skills for 24 hours
   - Cache job descriptions for 7 days

5. **Monitor rate limits:**
   - Check X-RateLimit-* headers
   - Implement exponential backoff for retries

---

**API Version:** 2.0  
**Last Updated:** March 3, 2026  
**Docs Updated:** Comprehensive with examples
