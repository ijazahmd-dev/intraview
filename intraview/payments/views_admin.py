from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
import csv
from django.http import HttpResponse

from .models import TokenPack, PaymentOrder
from serializers import AdminTokenPackSerializer, TokenPackFilter, AdminPaymentOrderSerializer, PaymentOrderFilter

from payments.pagination import AdminPaymentOrderPagination

from authentication.authentication import AdminCookieJWTAuthentication
from authentication.permissions import IsAdminRole





class AdminTokenPackListCreateAPIView(generics.ListCreateAPIView):

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAdminRole]

    queryset = TokenPack.objects.filter(is_active=True).order_by("price_inr")
    serializer_class = AdminTokenPackSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_class = TokenPackFilter
    search_fields = ["name"]
    ordering_fields = ["price_inr", "tokens", "created_at"]




class AdminTokenPackDetailAPIView(generics.RetrieveUpdateAPIView):
    """
    Admin API to retrieve and update a token pack.
    PATCH only (no PUT / DELETE).
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAdminRole]

    serializer_class = AdminTokenPackSerializer
    queryset = TokenPack.objects.all()

    http_method_names = ["get", "patch"]



    
class AdminPaymentOrderListAPIView(generics.ListAPIView):
    """
    Admin API to list payment orders (read-only).
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAdminRole]

    serializer_class = AdminPaymentOrderSerializer
    pagination_class = AdminPaymentOrderPagination

    queryset = (
        PaymentOrder.objects
        .select_related("user", "token_pack")
        .all()
        .order_by("-created_at")
    )

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = PaymentOrderFilter
    search_fields = [
        "internal_order_id",
        "user__email",
        "stripe_checkout_session_id",
        "stripe_payment_intent_id",
    ]
    ordering_fields = ["created_at", "amount_inr"]




class AdminPaymentOrderDetailAPIView(generics.RetrieveAPIView):
    """
    Admin API to retrieve a payment order (read-only).
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAdminRole]

    serializer_class = AdminPaymentOrderSerializer
    queryset = PaymentOrder.objects.select_related('user', 'token_pack')





class AdminPaymentOrderExportCSVAPIView(generics.ListAPIView):
    """
    Admin API to export payment orders as CSV.
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAdminRole]

    queryset = PaymentOrder.objects.select_related("user", "token_pack").all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = PaymentOrderFilter

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="payment_orders.csv"'
        )

        writer = csv.writer(response)
        writer.writerow([
            "ID",
            "Order ID",
            "User Email",
            "Amount (INR)",
            "Status",
            "Created At",
        ])

        for order in queryset:
            writer.writerow([
                order.id,
                order.internal_order_id,
                order.user.email,
                order.amount_inr,
                order.status,
                order.created_at,
            ])

        return response
