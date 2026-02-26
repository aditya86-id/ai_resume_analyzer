# resumes/urls.py

from django.urls import path
from .views import ResumeUploadView, ResumeDetailView

urlpatterns = [
    path("upload/", ResumeUploadView.as_view()),
    path("<int:pk>/", ResumeDetailView.as_view()),
]