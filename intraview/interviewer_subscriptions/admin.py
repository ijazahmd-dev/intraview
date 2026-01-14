from django.contrib import admin
from .models import InterviewerSubscription, InterviewerSubscriptionPlan
# Register your models here.


admin.site.register(InterviewerSubscriptionPlan)
admin.site.register(InterviewerSubscription)