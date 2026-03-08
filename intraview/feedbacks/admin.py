from django.contrib import admin
from .models import CandidateEvaluation, InterviewerReview

# Register your models here.
admin.site.register(CandidateEvaluation)
admin.site.register(InterviewerReview)
