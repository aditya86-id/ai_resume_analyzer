#!/bin/bash
# NLP Feature Setup and Testing Guide

echo "==================================="
echo "AI Resume Analyzer - NLP Setup Guide"
echo "==================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
echo "Run the following command in the backend directory:"
echo ""
echo "  cd backend"
echo "  pip install -r requirements.txt"
echo ""

# Step 2: Apply migrations
echo "🗄️ Step 2: Applying database migrations..."
echo "Run the following commands:"
echo ""
echo "  python manage.py migrate"
echo "  python manage.py migrate api"
echo ""

# Step 3: Start the server
echo "🚀 Step 3: Starting the development server..."
echo "Run:"
echo ""
echo "  python manage.py runserver"
echo ""

echo "==================================="
echo "Testing the NLP Features"
echo "==================================="
echo ""

cat << 'EOF'
### Test 1: Analyze a Job Description

Use curl or Postman to test the analyze endpoint:

```bash
curl -X POST http://localhost:8000/api/jobs/analyze/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Python Developer",
    "description": "We are looking for a Senior Python developer with 5+ years of experience. Required skills: Python, Django, PostgreSQL, Docker, AWS. Nice to have: Kubernetes, Redis, Machine Learning. Strong communication and problem-solving skills required."
  }'
```

Expected Response:
```json
{
  "status": "success",
  "analysis": {
    "extracted_skills": [
      {
        "name": "Python",
        "category": "programming",
        "confidence": 100,
        "occurrences": 2
      },
      {
        "name": "Django",
        "category": "web",
        "confidence": 90,
        "occurrences": 1
      },
      ...
    ],
    "experience_level": "senior",
    "skill_categories": {
      "programming": ["Python"],
      "web": ["Django"],
      "database": ["PostgreSQL"],
      "cloud": ["Docker", "AWS"]
    },
    "requirements_summary": "Have specific required skills | Work on-site"
  }
}
```

### Test 2: Create a Job with Auto-analysis

```bash
curl -X POST http://localhost:8000/api/jobs/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Engineer",
    "company": "TechCorp",
    "location": "San Francisco, CA",
    "description": "Seeking experienced Full Stack Engineer. Must have: JavaScript, React, Node.js, MongoDB, Git. Should have: Docker, CI/CD, AWS. 3+ years of web development experience.",
    "salary_min": 120000,
    "salary_max": 180000
  }'
```

The response will include extracted_skills and experience_level automatically.

### Test 3: Match a Resume to a Job

After creating a job description and having a resume with analysis:

```bash
curl -X POST http://localhost:8000/api/jobs/{job_id}/match_resume/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": 1
  }'
```

Expected Response:
```json
{
  "id": 1,
  "job": {
    "id": 1,
    "title": "Full Stack Engineer",
    "extracted_skills": [...]
  },
  "match_score": 78.5,
  "matched_skills": [
    {"skill": "javascript", "match": "JavaScript", "score": 100},
    {"skill": "react", "match": "React", "score": 100}
  ],
  "partial_matches": [
    {"skill": "docker", "match": "Docker", "score": 80}
  ],
  "missing_skills": ["AWS", "CI/CD"],
  "match_quality": "good",
  "match_details": {
    "overall_score": 78.5,
    "job_analysis": {...}
  }
}
```

### Test 4: List All Job Matches for a Resume

```bash
curl -X GET http://localhost:8000/api/resumes/{resume_id}/matching/ \
  -H "Authorization: Token YOUR_TOKEN"
```

Returns all jobs ranked by match score.

---

## Frontend Testing

1. **Add Job Description:**
   - Navigate to the Jobs page
   - Click "+ Add Job Description"
   - Fill in the form with job details
   - Click "Analyze with NLP" to preview the analysis
   - Click "Add Job Description" to save

2. **Match Resume to Job:**
   - On the Jobs page, each job shows extracted skills
   - Click "Match with Resume" dropdown
   - Select a resume from your list
   - View the detailed matching analysis in the modal

3. **View Recommendations:**
   - The matching modal shows:
     - Overall match score
     - Matched, partial, and missing skills
     - Skill-to-learn recommendations
     - Quality assessment

---

## Sample Job Descriptions for Testing

### Entry-Level Position
```
Junior Front-End Developer

We're looking for an entry-level Front-End Developer to join our growing team.

Required Skills:
- HTML5, CSS3, JavaScript
- React or Vue.js
- Git version control
- Responsive web design

Nice to Have:
- TypeScript
- Basic understanding of APIs
- Experience with CSS frameworks

Responsibilities:
- Build responsive web interfaces
- Write clean, maintainable code
- Collaborate with designers and backend developers
```

### Senior Position
```
Senior Software Architect

We are seeking a Senior Software Architect with 10+ years of experience building scalable systems.

Required:
- Python, Java, or Go
- Microservices architecture
- Kubernetes and Docker
- AWS or Azure
- CI/CD pipelines
- SQL and NoSQL databases

Preferred:
- Machine Learning experience
- Event-driven architectures
- GraphQL
- Terraform for IaC

Location: Remote
Salary: $150,000-$200,000
```

### Data Science Role
```
Data Scientist - Machine Learning

Join our Data Science team to build ML models that drive business decisions.

Requirements:
- Python, R, or both
- Machine Learning frameworks (TensorFlow, PyTorch, scikit-learn)
- SQL and data manipulation
- Statistical analysis
- 3+ years of experience

Nice to Have:
- Deep Learning experience
- NLP projects
- Data visualization (Tableau, Power BI)
- Cloud platforms (AWS, GCP, Azure)
```

---

## Troubleshooting

### Issue: Skills Not Being Extracted
**Solution:**
- Ensure the skill name matches the keyword dictionary
- Try using different variations (e.g., "React.js" vs "React")
- Check that the job description contains the skill mentioned

### Issue: Low Matching Scores
**Solution:**
- Ensure resume was properly analyzed first
- Check that resume skills were correctly extracted
- Consider that missing skills might legitimately lower the score
- Try uploading a more skill-rich resume

### Issue: Migration Errors
**Solution:**
- Verify you're in the correct directory: `cd backend`
- Check database is running properly
- Run: `python manage.py makemigrations api`
- Then: `python manage.py migrate`

### Issue: Module Import Errors
**Solution:**
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Try: `pip install --upgrade fuzzywuzzy python-Levenshtein`

---

## Performance Tips

1. **Caching:**
   - Job descriptions are cached after first analysis
   - To force re-analysis, click "Update" on the job

2. **Bulk Operations:**
   - For multiple jobs, batch analysis might be beneficial
   - Consider adding a bulk import feature

3. **Database Queries:**
   - Indexed queries on user_id and created_at
   - Use select_related() and prefetch_related() for optimization

---

## Next Steps

1. ✅ Test with various job descriptions
2. ✅ Monitor matching accuracy
3. ⏳ Collect feedback from users
4. Enhance keyword dictionary based on feedback
5. Consider implementing caching for performance
6. Add batch job upload feature
7. Implement advanced matching features (years of experience, location, salary)

---

## Support

For issues or questions, refer to:
- [NLP_IMPLEMENTATION.md](./NLP_IMPLEMENTATION.md) - Detailed technical documentation
- Backend logs: `python manage.py runserver` output
- Django admin: Create test data at `/admin`

Good luck with your testing! 🚀
EOF

echo ""
echo "==================================="
echo "Setup complete! Follow the steps above to get started."
echo "==================================="
