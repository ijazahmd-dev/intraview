from django.urls import path
from . import views
from . import views_admin


urlpatterns = [
    
    path("token-packs/", views.TokenPackListAPIView.as_view(), name="token-pack-list"),
    path('order/<str:internal_order_id>/', views.PaymentOrderRetrieveAPIView.as_view(), name='payment-order-retrieve'),
    path('invoice/<str:internal_order_id>/', views.PaymentInvoiceDownloadAPIView.as_view(), name='payment-invoice-download'),

    path("token-purchase/", views.CreateTokenPurchaseAPIView.as_view(), name="create-token-purchase"),
    # ──────────────────────────────────────────────────────────────────────────
    # Single unified Stripe webhook — all event types routed internally
    # stripe listen --forward-to localhost:8000/api/payments/webhook/stripe/
    # ──────────────────────────────────────────────────────────────────────────
    path("webhook/stripe/", views.StripeWebhookView.as_view(), name="stripe-webhook"),


####################################################################  Candidate Subscription APIs ############################################################


    path("subscriptions/checkout/",views.CreateSubscriptionCheckoutAPIView.as_view(),name="subscription-checkout",),


####################################################################  Interviewer APIs ############################################################


    path("interviewer/subscription/checkout/",views.CreateInterviewerSubscriptionCheckoutAPIView.as_view(),name="interviewer-subscription-checkout",),
    # NOTE: interviewer-subscriptions/webhook/stripe/ removed — handled by the unified endpoint above



####################################################################  Admin APIs ############################################################

  



    path("admin/payments/token-packs/",views_admin.AdminTokenPackListCreateAPIView.as_view(),name="admin-token-pack-list-create",),
    path("admin/payments/token-packs/<int:pk>/",views_admin.AdminTokenPackDetailAPIView.as_view(),name="admin-token-pack-detail",),
    path("admin/payments/orders/",views_admin.AdminPaymentOrderListAPIView.as_view(),name="admin-payment-order-list",),
    path("admin/payments/orders/<int:pk>/",views_admin.AdminPaymentOrderDetailAPIView.as_view(),name="admin-payment-order-detail",),
    path("admin/payments/orders/export-csv/",views_admin.AdminPaymentOrderExportCSVAPIView.as_view(),name="admin-payment-order-export-csv",),
]

