from django.db import models
from django.contrib.auth.models import User

class Resume(models.Model):
    STATUS_CHOICES = (
        ("UPLOADED","Uploaded"),
        ("PROCESSING","Processing"),
        ("DONE","Done"),
        ("FAILED","Failed"),
    )
    
    
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to="resumes/")
    extracted_text = models.TextField(blank=True,null=True)
    
    skills = models.JSONField(blank=True, null=True)
    ats_score = models.FloatField(blank=True, null=True)
    suggestions = models.JSONField(blank=True, null=True)
    
    status=models.CharField(max_length=20,choices = STATUS_CHOICES, default="UPLOADED")
    
    created_at = models.DateField(auto_now_add=True)
    
    
    def __str__(self):
        return f"{self.user.username} Resume{self.id}"