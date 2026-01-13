from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, SubscriptionTokenGrant

# Register your models here.


admin.site.register(SubscriptionPlan)
admin.site.register(UserSubscription)
admin.site.register(SubscriptionTokenGrant)