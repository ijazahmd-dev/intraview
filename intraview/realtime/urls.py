from django.urls import path
from realtime.views import ZegoTokenAPIView

urlpatterns = [

    path(
        "zego/token/<int:booking_id>/",
        ZegoTokenAPIView.as_view()
    )

]