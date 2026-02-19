# ai_resume_analyzer



│                    FRONTEND (Next.js)                            │
│         (Auth Context, React Query, Tailwind UI)                │
│  Pages: Auth | Dashboard | Upload | Results | Job Matching     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────┐
│              API GATEWAY (FastAPI)                               │
│  ├─ Auth Endpoints (signup/login/logout)                        │
│  ├─ Resume Upload & Progress                                    │
│  ├─ Job Description Upload                                      │
│  ├─ Matching & Analysis Results                                 │
│  └─ User Dashboard/Analytics                                    │
└─────────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
    │ PostgreSQL  │    │ Redis Cache  │    │ Celery Queue │
    │ (Main DB)   │    │ (Sessions)   │    │ (Background) │
    │             │    │ (Results)    │    │ (Parsing)    │
    └─────────────┘    └──────────────┘    └──────────────┘
                            │                    │
                            │                    ▼
                            │         ┌──────────────────────┐
                            │         │  Task Workers        │
                            │         │  ├─ PDF/DOCX Parse   │
                            │         │  ├─ spaCy Extraction │
                            │         │  ├─ ATS Scoring      │
                            │         │  └─ JD Matching      │
                            │         └──────────────────────┘
                            │
                     ┌──────────────────────────────┐
                     │  File Storage (S3/LocalFS)   │
                     │  Temp uploads & archives     │
                     └──────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │  AI/NLP Services (Running in Celery Workers)            │
    │  ├─ spaCy (en_core_web_trf) - Entity & skill extraction │
    │  ├─ sentence-transformers - Semantic similarity         │
    │  └─ Optional: GPT/Claude - Resume improvements          │
    └─────────────────────────────────────────────────────────┘
