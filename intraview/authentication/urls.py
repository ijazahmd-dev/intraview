from django.urls import path
from . import views
from . import views_admin
from rest_framework.routers import SimpleRouter




router = SimpleRouter()
router.register(r"admin/users", views_admin.AdminUserViewSet, basename="admin-users")



urlpatterns = [

    path('signup/', views.SignupView.as_view(),name='signup'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path("resend-otp/", views.ResendOtpView.as_view(), name="resend-otp"),

    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("me/", views.MeView.as_view(), name="me"),

    path("forgot-password/", views.RequestPasswordResetView.as_view(), name="forgot-password"),
    path("forgot-password/verify-otp/", views.VerifyResetOTPView.as_view(), name="fp-verify-otp"),
    path("forgot-password/reset/", views.ResetPasswordView.as_view(), name="reset-password"),
    path("google-login/", views.GoogleLoginView.as_view(), name="google-login"),

    path("admin/login/", views_admin.AdminLoginView.as_view(), name="admin-login"),
    path("admin/logout/", views_admin.AdminLogoutView.as_view(), name="admin-logout"),
    
]

urlpatterns += router.urls