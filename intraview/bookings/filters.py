import django_filters
from .models import InterviewBooking


class AdminInterviewBookingFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status")
    interviewer_email = django_filters.CharFilter(
        field_name="interviewer__email", lookup_expr="icontains"
    )
    candidate_email = django_filters.CharFilter(
        field_name="candidate__email", lookup_expr="icontains"
    )
    date_from = django_filters.DateFilter(
        field_name="created_at", lookup_expr="gte"
    )
    date_to = django_filters.DateFilter(
        field_name="created_at", lookup_expr="lte"
    )

    class Meta:
        model = InterviewBooking
        fields = [
            "status",
            "interviewer_email",
            "candidate_email",
            "date_from",
            "date_to",
        ]