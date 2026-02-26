# resumes/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Resume
from .serializers import ResumeSerializer
from .tasks import analyze_resume_task


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ResumeSerializer(data=request.data)
        if serializer.is_valid():
            resume = serializer.save(user=request.user)

            # 🔥 Trigger async AI analysis
            analyze_resume_task.delay(resume.id)

            return Response({"message": "Uploaded", "resume_id": resume.id})

        return Response(serializer.errors)
    
    
class ResumeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        resume = Resume.objects.get(id=pk, user=request.user)
        serializer = ResumeSerializer(resume)
        return Response(serializer.data)