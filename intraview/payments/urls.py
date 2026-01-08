from django.urls import path
from . import views
from . import views_admin


urlpatterns = [
    path("token-purchase/", views.CreateTokenPurchaseAPIView.as_view(), name="create-token-purchase"),
    path("webhook/stripe/", views.StripeWebhookView.as_view(), name="stripe-webhook"),

    path("subscriptions/checkout/",views.CreateSubscriptionCheckoutAPIView.as_view(),name="subscription-checkout",),
    path("subscriptions/webhook/stripe/",views.StripeSubscriptionWebhookView.as_view(),name="stripe-subscription-webhook",),

    path("interviewer/subscription/checkout/",views.CreateInterviewerSubscriptionCheckoutAPIView.as_view(),name="interviewer-subscription-checkout",),
    path("interviewer-subscriptions/webhook/stripe/",views.StripeInterviewerSubscriptionWebhookView.as_view(),name="stripe-interviewer-subscription-webhook",),



    ####################################################################  Admin APIs  ############################################################



    path("admin/payments/token-packs/",views_admin.AdminTokenPackListCreateAPIView.as_view(),name="admin-token-pack-list-create",),
    path("admin/payments/token-packs/<int:pk>/",views_admin.AdminTokenPackDetailAPIView.as_view(),name="admin-token-pack-detail",),
    path("admin/payments/orders/",views_admin.AdminPaymentOrderListAPIView.as_view(),name="admin-payment-order-list",),
    path("admin/payments/orders/<int:pk>/",views_admin.AdminPaymentOrderDetailAPIView.as_view(),name="admin-payment-order-detail",),
    path("admin/payments/orders/export-csv/",views_admin.AdminPaymentOrderExportCSVAPIView.as_view(),name="admin-payment-order-export-csv",),
]