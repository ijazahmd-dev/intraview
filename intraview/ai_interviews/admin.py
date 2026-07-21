# ai_interviews/admin.py

from django.contrib import admin

from .models import (
    Role,
    AIInterviewSession,
    AIInterviewFinalReport,
    AIInterviewTurn,
    AIInterviewEvaluation,
    AIInterviewIntegrityEvent,
    InterviewRuntimeState,
)





admin.site.register(AIInterviewSession)
admin.site.register(AIInterviewFinalReport)
admin.site.register(AIInterviewTurn)
admin.site.register(AIInterviewEvaluation)
admin.site.register(AIInterviewIntegrityEvent)
admin.site.register(InterviewRuntimeState)
