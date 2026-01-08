import csv
from django.http import HttpResponse

from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import TokenTransaction, TokenWallet
from .serializers import AdminTokenWalletSerializer, AdminTokenTransactionSerializer, TokenWalletFilter, TokenTransactionFilter, AdminWalletStatsSerializer 
from .pagination import AdminWalletPagination

from authentication.authentication import AdminCookieJWTAuthentication
from authentication.permissions import IsAdminRole



class AdminTokenWalletListAPIView(generics.ListAPIView):
    """
    Admin API to list token wallets (read-only).
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAdminRole]

    serializer_class = AdminTokenWalletSerializer
    pagination_class = AdminWalletPagination

    queryset = (
        TokenWallet.objects
        .select_related("user")
        .all()
        .order_by("-updated_at")
    )

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = TokenWalletFilter
    search_fields = ["user__email"]
    ordering_fields = ["balance", "locked_balance", "created_at"]







class AdminTokenTransactionListAPIView(generics.ListAPIView):
    """
    Admin API to view token transactions for a user (read-only).
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAdminRole]

    serializer_class = AdminTokenTransactionSerializer
    pagination_class = AdminWalletPagination

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return (
            TokenTransaction.objects
            .select_related("wallet__user")
            .filter(wallet__user_id=user_id)
            .order_by("-created_at")
        )

    filter_backends = [DjangoFilterBackend]
    filterset_class = TokenTransactionFilter






class AdminTokenTransactionExportCSVAPIView(generics.ListAPIView):
    """
    Admin API to export token ledger as CSV.
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAdminRole]

    filter_backends = [DjangoFilterBackend]
    filterset_class = TokenTransactionFilter

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return (
            TokenTransaction.objects
            .select_related("wallet__user")
            .filter(wallet__user_id=user_id)
            .order_by("-created_at")
        )

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="token_transactions.csv"'
        )

        writer = csv.writer(response)
        writer.writerow([
            "ID",
            "User Email",
            "Type",
            "Amount",
            "Reference",
            "Note",
            "Created At",
        ])

        for tx in queryset:
            writer.writerow([
                tx.id,
                tx.wallet.user.email,
                tx.transaction_type,
                tx.amount,
                tx.reference_id,
                tx.note,
                tx.created_at,
            ])

        return response




class AdminWalletStatsAPIView(APIView):
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_wallets = TokenWallet.objects.count()
        total_balance = (
            TokenWallet.objects.aggregate(total=Sum("balance"))["total"] or 0
        )
        top_wallet = TokenWallet.objects.order_by("-balance").first()

        data = {
            "total_wallets": total_wallets,
            "total_balance_all": total_balance,
            "top_wallet_balance": top_wallet.balance if top_wallet else 0,
        }

        serializer = AdminWalletStatsSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data)

        