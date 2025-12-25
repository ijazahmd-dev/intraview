from django.contrib import admin
from .models import InterviewerApplication,InterviewerAvailability,InterviewerProfile,InterviewerVerification

# Register your models here.

admin.site.register(InterviewerApplication)
admin.site.register(InterviewerAvailability)
admin.site.register(InterviewerProfile)

admin.site.register(InterviewerVerification)



