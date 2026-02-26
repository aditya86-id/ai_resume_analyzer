from rest_framework import serializers
from .models import Resume

class ResumeSeializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = "__all__"
        read_only_fields = ["skills","ats_score","suggestions","status"]