from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, SubscriptionTokenGrant, SubscriptionPaymentOrder

# Register your models here.


admin.site.register(SubscriptionPlan)
admin.site.register(UserSubscription)
admin.site.register(SubscriptionTokenGrant)
admin.site.register(SubscriptionPaymentOrder)