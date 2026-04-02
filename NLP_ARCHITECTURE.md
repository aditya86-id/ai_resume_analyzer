# NLP System Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI Resume Analyzer with NLP                 │
└─────────────────────────────────────────────────────────────────┘

FRONTEND (React)
┌──────────────────────────────────────────────────────────────┐
│                        JobsPage                               │
├──────────────────────────────────────────────────────────────┤
│  ├─ JobDescriptionForm                                       │
│  │  └─ Input: Title, Company, Description                    │
│  │  └─ Action: Analyze with NLP                              │
│  │  └─ Display: Extracted Skills, Experience Level           │
│  │                                                             │
│  └─ Job List with Matching                                   │
│     └─ Show: Extracted Skills, Experience Level               │
│     └─ Action: Match with Resume                              │
│     └─ Modal: JobMatchingResults                              │
│        └─ Display: Match Score, Skills Breakdown              │
└─────────────────────────────────────────────────────────────┘
         ↕ HTTP Requests (with Token Auth)
┌──────────────────────────────────────────────────────────────┐
│ BACKEND (Django REST API)                                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /api/jobs/                                             │
│  ├─ Receive: Job data                                        │
│  ├─ Call: JobDescriptionViewSet.perform_create()            │
│  └─ Call: _analyze_job_description()                         │
│     └─ Store: Extracted skills, experience level             │
│                                                               │
│  POST /api/jobs/analyze/                                     │
│  ├─ Receive: Job text                                        │
│  └─ Return: NLP analysis                                     │
│                                                               │
│  POST /api/jobs/{id}/match_resume/                           │
│  ├─ Receive: Resume ID                                       │
│  ├─ Call: JobMatchingService.nlp_match_score()              │
│  └─ Return: Detailed matching report                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
         ↕ Service Layer
┌──────────────────────────────────────────────────────────────┐
│ NLP SERVICES (api/services.py)                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  NLPService                                                  │
│  ├─ extract_skills_from_text()                              │
│  │  └─ Keyword matching in 50+ skills                        │
│  │  └─ Return: [skill, confidence, occurrences]             │
│  │                                                            │
│  ├─ detect_experience_level()                               │
│  │  └─ Pattern matching for experience level                 │
│  │  └─ Return: entry|junior|mid|senior|executive            │
│  │                                                            │
│  ├─ calculate_semantic_similarity()                          │
│  │  └─ Fuzzy string matching using token_set_ratio          │
│  │  └─ Classify: exact/partial/missing                      │
│  │  └─ Return: {score, matched, partial, missing}           │
│  │                                                            │
│  ├─ analyze_job_description()                               │
│  │  └─ Call: extract_skills_from_text()                     │
│  │  └─ Call: detect_experience_level()                      │
│  │  └─ Return: Full analysis                                │
│  │                                                            │
│  └─ match_resume_to_job()                                   │
│     └─ Call: analyze_job_description()                      │
│     └─ Call: calculate_semantic_similarity()                │
│     └─ Return: Matching report with recommendations          │
│                                                               │
│  JobMatchingService                                          │
│  └─ nlp_match_score()                                        │
│     └─ Orchestrate NLP matching                              │
│     └─ Create JobMatch record                                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
         ↕ Database Access
┌──────────────────────────────────────────────────────────────┐
│ DATABASE MODELS (Django ORM)                                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  JobDescription                                              │
│  ├─ id, title, company, location                             │
│  ├─ description, salary_min/max                              │
│  ├─ required_skills (manual)                                 │
│  ├─ extracted_skills ← NLP OUTPUT                            │
│  ├─ experience_level ← NLP OUTPUT                            │
│  ├─ skill_categories ← NLP OUTPUT                            │
│  └─ nlp_analysis ← NLP OUTPUT                                │
│                                                               │
│  JobMatch                                                    │
│  ├─ id, analysis_id, job_id                                  │
│  ├─ match_score ← NLP CALCULATION                            │
│  ├─ matched_skills ← NLP OUTPUT                              │
│  ├─ partial_matches ← NLP OUTPUT                             │
│  ├─ missing_skills ← NLP OUTPUT                              │
│  └─ match_quality ← NLP ASSESSMENT                           │
│                                                               │
│  Resume & ResumeAnalysis                                     │
│  └─ (Already existed - NLP matches with these)               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow: Job Description Processing

```
User Input (Frontend)
    ↓
POST /api/jobs/ or POST /api/jobs/analyze/
    ↓
JobDescriptionViewSet receives request
    ↓
Extract job text (title + description)
    ↓
NLPService.analyze_job_description(text)
    ├─ Step 1: Extract skills
    │  ├─ Tokenize and normalize text
    │  ├─ Match against SKILL_KEYWORDS (7 categories)
    │  ├─ Count occurrences
    │  └─ Calculate confidence = (occurrences / 3) * 100
    │
    ├─ Step 2: Detect experience level
    │  ├─ Search for level keywords (entry, senior, etc)
    │  ├─ Extract years mentioned
    │  └─ Map: years → entry|junior|mid|senior|executive
    │
    ├─ Step 3: Categorize skills
    │  └─ Group skills by type (programming, web, etc)
    │
    └─ Step 4: Generate summary
       └─ Extract key requirements (remote, travel, etc)
    ↓
Return analysis result
    ↓
If creating job: Save extracted_skills, experience_level to DB
    ↓
Return to frontend/API
    ↓
Display analysis to user
```

## Data Flow: Resume-Job Matching

```
User Selects Resume & Job (Frontend)
    ↓
POST /api/jobs/{id}/match_resume/ with resume_id
    ↓
JobDescriptionViewSet.match_resume() receives request
    ↓
Fetch Resume → Fetch ResumeAnalysis → Get resume.skills
    ↓
JobMatchingService.nlp_match_score(resume_analysis, job)
    ├─ Get job description text
    ├─ Get resume skills list
    │
    └─ NLPService.match_resume_to_job()
       ├─ Analyze job description (extract required skills)
       │
       ├─ For each job skill:
       │  - Find best match in resume skills
       │  - Use fuzzywuzzy.token_set_ratio()
       │  - Score 0-100
       │  - Classify:
       │    * >= 90: Exact match (100% weight)
       │    * 70-90: Partial match (50% weight)
       │    * < 70: Missing (0% weight)
       │
       ├─ Calculate overall_score
       │  └─ (exact_count * 100 + partial_count * 50) / total_skills * 100
       │
       ├─ Assess quality
       │  ├─ >= 80%: Excellent
       │  ├─ >= 60%: Good
       │  ├─ >= 40%: Fair
       │  └─ < 40%: Poor
       │
       └─ Generate recommendations
          └─ Missing skills to learn
          └─ Experience level assessment
    ↓
Create/Update JobMatch record
    ├─ match_score
    ├─ matched_skills
    ├─ missing_skills
    ├─ partial_matches
    ├─ match_quality
    └─ match_details
    ↓
Return to frontend via JobMatchSerializer
    ↓
Display JobMatchingResults modal
    └─ Show score, skills breakdown, recommendations
```

## Skill Extraction Algorithm

```
Input: Text containing job description

Process:
1. Normalize text:
   - Convert to lowercase
   - Split into words/phrases

2. For each skill category (7 total):
   - programming: [python, javascript, java, ...]
   - web: [react, angular, vue, ...]
   - database: [sql, mysql, postgresql, ...]
   - cloud: [aws, azure, docker, ...]
   - data: [machine learning, tensorflow, ...]
   - devops: [linux, git, jenkins, ...]
   - soft_skills: [communication, leadership, ...]

3. For each skill in category:
   - Search if skill appears in text
   - Count occurrences
   - Calculate confidence = min(100, (count / 3) * 100)
   - Store: {name, category, confidence, occurrences}

4. Sort by confidence descending

Output: Sorted list of extracted skills
```

## Matching Score Algorithm

```
Input:
- resume_skills: [python, django, react, ...]
- job_skills: [python, django, docker, aws, ...]

Process:
For each job_skill:
  best_match = None
  best_score = 0
  
  For each resume_skill:
    similarity = fuzzywuzzy.token_set_ratio(resume, job)
    if similarity > best_score:
      best_score = similarity
      best_match = resume_skill
  
  if best_score >= 90: exact_matches.append(skill)
  elif best_score >= 70: partial_matches.append(skill)
  else: missing_skills.append(skill)

Calculate overall score:
  exact_weight = len(exact_matches)
  partial_weight = len(partial_matches) * 0.5
  total_weight = exact_weight + partial_weight
  score = (total_weight / len(job_skills)) * 100

Output:
{
  overall_score: 0-100,
  matched_skills: [...],
  partial_matches: [...],
  missing_skills: [...],
  match_quality: excellent|good|fair|poor
}
```

## Component Interaction

```
Frontend Layer:
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  JobsPage       │───▶│ JobDescription   │    │ JobMatching      │
│                 │    │ Form             │    │ Results Modal    │
└────────┬────────┘    └──────────────────┘    └──────────────────┘
         │ (actions)           │                      │
API Layer:
         └────────────▶ jobsAPI.create()              │
                       jobsAPI.analyze()      ┌──────┘
                       jobsAPI.matchResume()──▶

Backend Layer:
┌─────────────────────────────────────────────┐
│ Views:                                      │
│  - JobDescriptionViewSet                    │
│  - JobMatchingView                          │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ Services:                                   │
│  - JobMatchingService                       │
│  - NLPService                               │
│  - AuditService                             │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ Models (Database):                          │
│  - JobDescription                           │
│  - JobMatch                                 │
│  - ResumeAnalysis (existing)                │
│  - Skill (existing)                         │
└─────────────────────────────────────────────┘
```

## Error Handling Flow

```
Try: Analyze Job Description
  ├─ NLPService analysis
  │  └─ Error: Log error, continue with fallback
  │
  ├─ Save to database
  │  └─ Error: Return BadRequest response
  │
  └─ Success: Return analysis
    └─ Error on frontend: Show Alert component

Try: Match Resume to Job
  ├─ NLPService.nlp_match_score()
  │  ├─ Error: Log, use basic_matching as fallback
  │  └─ Success: Store detailed match_details
  │
  └─ Success: Return JobMatch with results
    └─ Error on frontend: Show error message in modal
```

---

This architecture ensures:
✅ Separation of concerns (NLP logic isolated in services)
✅ Reusability (NLPService used by multiple views)
✅ Scalability (Stateless services can scale) 
✅ Maintainability (Clear data flow)
✅ Fault tolerance (Error handling at each layer)
