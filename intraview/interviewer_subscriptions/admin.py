from django.contrib import admin
from .models import InterviewerSubscription, InterviewerSubscriptionPlan, InterviewerPaymentOrder
# Register your models here.


admin.site.register(InterviewerSubscriptionPlan)
admin.site.register(InterviewerSubscription)
admin.site.register(InterviewerPaymentOrder)