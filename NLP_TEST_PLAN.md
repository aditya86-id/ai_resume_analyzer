# NLP Implementation Test Plan

## Pre-Test Checklist

- [ ] All NLP dependencies installed (pip install -r requirements.txt)
- [ ] Database migrations applied (python manage.py migrate)
- [ ] Server running (python manage.py runserver)
- [ ] Frontend running (npm run dev)
- [ ] Fresh user account created for testing
- [ ] Test resumes uploaded and analyzed

---

## Test Suite 1: Skill Extraction

### Test 1.1: Basic Skill Extraction
**Description:** Test that common skills are correctly extracted

**Input:**
```
Job Description:
"Senior Python Developer needed. Must know Django, PostgreSQL, Docker, and AWS. 
Experience with React is a plus."
```

**Expected Output:**
- ✅ Extracted skills include: Python, Django, PostgreSQL, Docker, AWS
- ✅ React appears (if in extraction threshold)
- ✅ Confidence scores > 0
- ✅ Category assignments correct

**Test Command:**
```bash
curl -X POST http://localhost:8000/api/jobs/analyze/ \
  -H "Authorization: Token TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Senior Python Developer", "description": "Senior Python Developer needed. Must know Django, PostgreSQL, Docker, and AWS..."}'
```

### Test 1.2: Multiple Mentions (Confidence Scoring)
**Description:** Verify confidence increases with multiple mentions

**Input:**
```
"Python is essential. Python experience required. Python expertise of 5+ years needed."
```

**Expected Output:**
- ✅ Python extracted with high confidence (100%)
- ✅ Other skills with lower confidence

### Test 1.3: Variant Skill Names
**Description:** Test that skill variants are recognized

**Input:**
```
"Need JavaScript experience with JS frameworks. NodeJS backend development."
```

**Expected Output:**
- ✅ Both JavaScript and Node.js extracted
- ✅ No false duplicates
- ✅ Correct categorization

### Test 1.4: Edge Cases - No Skills
**Description:** Handle job descriptions with no recognizable skills

**Input:**
```
"General business analyst role. Communication important."
```

**Expected Output:**
- ✅ Extract relevant soft skills (communication)
- ✅ Don't crash or return error
- ✅ Return empty skills gracefully

---

## Test Suite 2: Experience Level Detection

### Test 2.1: Senior Level Detection
**Description:** Correctly identify senior position

**Examples:**
- "Senior Software Engineer" → senior ✅
- "10+ years experience" → senior ✅
- "Principal Architect" → senior ✅
- "Lead Developer" → senior ✅

### Test 2.2: Entry Level Detection
**Description:** Correctly identify entry-level position

**Examples:**
- "Junior Developer" → junior ✅
- "Entry-level position" → entry ✅
- "0-2 years experience" → entry ✅

### Test 2.3: Mid Level Detection
**Description:** Correctly identify mid-level position

**Examples:**
- "Mid-level Engineer" → mid ✅
- "3-5 years experience" → mid ✅

### Test 2.4: Default Level
**Description:** Use default when level not specified

**Input:**
```
"Developer wanted to write code."
```

**Expected Output:**
- ✅ Returns 'mid' as default ✅

---

## Test Suite 3: Job Analysis Completeness

### Test 3.1: Full Analysis Structure
**Description:** Verify all analysis fields are returned

**Expected Fields in Response:**
- ✅ extracted_skills (array)
- ✅ experience_level (string)
- ✅ skill_categories (object)
- ✅ requirements_summary (string)
- ✅ keyword_density (object)

### Test 3.2: Skill Categories
**Description:** Verify skills are properly categorized

**Input:** Job with Python (programming), React (web), PostgreSQL (database), Docker (cloud)

**Expected Output:**
```json
{
  "skill_categories": {
    "programming": ["Python"],
    "web": ["React"],
    "database": ["PostgreSQL"],
    "cloud": ["Docker"]
  }
}
```

### Test 3.3: Requirements Summary
**Description:** Verify key requirements are extracted

**Input:**
```
"Remote position. Must be willing to travel 10%. On-site meetings monthly."
```

**Expected Output:**
```
"Can work remotely | Willing to travel | Work on-site"
```

---

## Test Suite 4: Job Creation with Auto-Analysis

### Test 4.1: Create and Auto-Analyze
**Description:** Job creation triggers NLP analysis

**Request:**
```bash
curl -X POST http://localhost:8000/api/jobs/ \
  -H "Authorization: Token TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Engineer",
    "company": "TechCorp",
    "location": "San Francisco",
    "description": "We seek Full Stack Engineer with React, Node.js, MongoDB, Docker experience. 3+ years required.",
    "salary_min": 120000,
    "salary_max": 180000
  }'
```

**Expected Response:**
- ✅ Job created successfully (status 201)
- ✅ Response includes extracted_skills
- ✅ experience_level = "mid"
- ✅ skill_categories populated
- ✅ Stored in database

### Test 4.2: Verification in Database
**Check:**
```bash
# Via Django admin or API
curl -X GET http://localhost:8000/api/jobs/1/ \
  -H "Authorization: Token TOKEN"
```

**Expected:**
- ✅ extracted_skills field has values
- ✅ experience_level populated
- ✅ nlp_analysis field contains full analysis

---

## Test Suite 5: Resume-Job Matching

### Test 5.1: Exact Skill Match
**Setup:**
- Resume with skills: Python, Django, PostgreSQL, Docker
- Job requires: Python, Django, PostgreSQL, Docker

**Expected Result:**
- ✅ Match score = 100%
- ✅ All 4 in matched_skills
- ✅ 0 missing_skills
- ✅ match_quality = excellent

### Test 5.2: Partial Match
**Setup:**
- Resume with skills: Python, Django, MySQL
- Job requires: Python, Django, PostgreSQL, Docker, AWS

**Expected Result:**
- ✅ Match score ≈ 40-60%
- ✅ matched_skills = [Python, Django] (possibly MySQL/PostgreSQL partial)
- ✅ missing_skills = [Docker, AWS, (PostgreSQL if not matched)]
- ✅ match_quality = fair/good

### Test 5.3: Poor Match
**Setup:**
- Resume with skills: HTML, CSS, Excel
- Job requires: Python, Java, Docker, Kubernetes

**Expected Result:**
- ✅ Match score ≈ 0-20%
- ✅ Few or no matched_skills
- ✅ Most skills in missing_skills
- ✅ match_quality = poor

### Test 5.4: Fuzzy Matching
**Setup:**
- Resume has: "JavaScript"
- Job requires: "JS"

**Expected Result:**
- ✅ Match detected (fuzzy matching)
- ✅ Counted as matched_skill
- ✅ Score > 70 for partial or exact

### Test 5.5: Recommendations Generated
**Check Response:** `/api/jobs/{id}/match_resume/`

**Expected:**
- ✅ recommendations array populated
- ✅ Contains actionable advice
- ✅ Skills to learn are listed
- ✅ No generic/empty recommendations

---

## Test Suite 6: Frontend Integration

### Test 6.1: Add Job Description Form
**Steps:**
1. Navigate to /jobs page
2. Click "+ Add Job Description"
3. Fill form:
   - Title: "React Developer"
   - Company: "WebCo"
   - Description: "Seeking React, Node.js developer with 2+ years experience"
4. Click "Analyze with NLP"

**Expected:**
- ✅ Loading state shown
- ✅ Analysis results displayed
- ✅ Shows extracted skills
- ✅ Shows experience level
- ✅ Shows skill categories

### Test 6.2: Save Job After Analysis
**Steps:**
1. After analysis shown
2. Click "Add Job Description"

**Expected:**
- ✅ Job saved successfully
- ✅ Modal closes
- ✅ Job appears in list
- ✅ Skills visible on job card

### Test 6.3: Match Resume to Job
**Steps:**
1. On JobsPage, locate a job
2. Click "Match with Resume" dropdown
3. Select a resume from list

**Expected:**
- ✅ Modal opens (JobMatchingResults)
- ✅ Loading spinner shows briefly
- ✅ Match details displayed:
   - Overall score
   - Matched skills
   - Missing skills
   - Recommendations

### Test 6.4: Matching Results Display
**Verify in Modal:**
- ✅ Score shown with color coding (green/blue/yellow/red)
- ✅ Score cards show: Matched, Partial, Missing counts
- ✅ Skills displayed as badges
- ✅ Recommendations list provided
- ✅ Quality badge shown
- ✅ Close button functional

### Test 6.5: Error Handling - Frontend
**Steps:**
1. Try operations with invalid data
2. Try without authorization

**Expected:**
- ✅ Error alerts shown
- ✅ User-friendly error messages
- ✅ App doesn't crash
- ✅ Can retry operation

---

## Test Suite 7: API Error Handling

### Test 7.1: Missing Required Fields
**Request:**
```bash
curl -X POST http://localhost:8000/api/jobs/analyze/ \
  -H "Authorization: Token TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Job"}'
```

**Expected:**
- ✅ Returns 400 Bad Request
- ✅ Clear error message: "description required"

### Test 7.2: Invalid Job ID
**Request:**
```bash
curl -X POST http://localhost:8000/api/jobs/99999/match_resume/ \
  -H "Authorization: Token TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resume_id": 1}'
```

**Expected:**
- ✅ Returns 404 Not Found
- ✅ Clear error message

### Test 7.3: Unauthorized Access
**Request (without token):**
```bash
curl -X POST http://localhost:8000/api/jobs/ \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Expected:**
- ✅ Returns 401 Unauthorized
- ✅ Redirects to login on frontend

### Test 7.4: NLP Service Failure Fallback
**Setup:** Disable NLP service (mock failure)

**Expected:**
- ✅ Falls back to basic matching
- ✅ Job still created/matched
- ✅ Error logged but not returned to user

---

## Test Suite 8: Performance

### Test 8.1: Job Analysis Speed
**Measure:** Time to analyze job description

**Target:** < 200ms

**Method:**
```bash
time curl -X POST http://localhost:8000/api/jobs/analyze/ \
  -H "Authorization: Token TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Test 8.2: Matching Speed
**Measure:** Time to calculate match score

**Target:** < 100ms

### Test 8.3: Database Query Performance
**Measure:** Time to return 10 jobs with matches

**Target:** < 500ms

### Test 8.4: Frontend Response Time
**Measure:** Latency from button click to modal display

**Target:** < 2 seconds total

---

## Test Suite 9: Data Integrity

### Test 9.1: Matching Reproducibility
**Steps:**
1. Match resume to job twice
2. Get matching results both times

**Expected:**
- ✅ Same match_score both times
- ✅ Same matched_skills list
- ✅ Same recommendations

### Test 9.2: Database Constraints
**Check:**
- ✅ No duplicate JobMatch records (unique_together)
- ✅ Foreign key constraints enforced
- ✅ Deleted resume cascades to matches

### Test 9.3: Skill Uniqueness
**Check:**
```bash
# Match same job to same resume twice
curl ... (first time)
curl ... (second time)
```

**Expected:**
- ✅ Only one JobMatch record in DB
- ✅ Previous record updated or kept (not duplicated)

---

## Manual Testing Scenarios

### Scenario 1: Real Job Description
**Source:** Indeed/LinkedIn/LinkedIn job posting

**Steps:**
1. Copy real job description
2. Paste into Job Description form
3. Analyze
4. Verify extracted skills make sense

### Scenario 2: Different Industries
Test with job descriptions from:
- [ ] Software Engineering
- [ ] Data Science
- [ ] DevOps
- [ ] Project Management
- [ ] UX Design

### Scenario 3: Varied Experience Levels
Test with jobs requiring:
- [ ] Entry-level (0-2 years)
- [ ] Mid-level (3-7 years)
- [ ] Senior (8+ years)
- [ ] Executive (10+ years)

### Scenario 4: Edge Cases
- [ ] Very short job description
- [ ] Very long job description (1000+ words)
- [ ] Job with rare/new technologies
- [ ] Job with only soft skills
- [ ] Job with special characters/formatting

---

## Regression Testing

After each change, verify:
- [ ] Existing jobs still display correctly
- [ ] Resume analysis still works
- [ ] Basic matching (non-NLP) still works as fallback
- [ ] No database migration issues
- [ ] Frontend styling still correct
- [ ] API responses still valid JSON

---

## Acceptance Criteria

All tests must pass for "Ready for Production":

✅ **Functionality**
- [ ] Jobs created with NLP analysis
- [ ] Skills extracted accurately (>80% accuracy on sample set)
- [ ] Experience levels detected correctly
- [ ] Matching scores calculated
- [ ] Recommendations provided

✅ **Performance**
- [ ] Job analysis < 200ms
- [ ] Matching calculation < 100ms
- [ ] Frontend loads < 2 seconds

✅ **Reliability**
- [ ] No crashes on invalid input
- [ ] Graceful error handling
- [ ] Fallback mechanisms work
- [ ] Database integrity maintained

✅ **User Experience**
- [ ] Forms work intuitively
- [ ] Modals display correctly
- [ ] Results clearly presented
- [ ] Error messages helpful

✅ **Code Quality**
- [ ] No console errors
- [ ] All migrations apply cleanly
- [ ] Logging working
- [ ] Documentation complete

---

## Sign-Off

**Testing Completed By:** ___________________

**Date:** ___________________

**Result:** ☐ PASS ☐ FAIL

**Notes:** _________________________________

**Ready for Production:** ☐ YES ☐ NO
