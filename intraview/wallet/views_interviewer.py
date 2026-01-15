from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from authentication.authentication import InterviewerCookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer

from .models import TokenTransaction, TokenTransactionType
from .services import TokenService

from .serializers import (
    InterviewerWalletSummarySerializer,
    InterviewerWalletTransactionSerializer,
    InterviewerWalletStatsSerializer,
    InterviewerEarningsSerializer,
)

from bookings.models import InterviewBooking










# -----------------------------------------
# Helper: simple pagination utility
# -----------------------------------------
def paginate_queryset(qs, request, default_page_size=20):
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("page_size", default_page_size))

    if page < 1:
        page = 1
    if page_size < 1:
        page_size = default_page_size
    if page_size > 100:
        page_size = 100  # ✅ Hard cap to prevent abuse

    start = (page - 1) * page_size
    end = start + page_size

    return page, page_size, qs.count(), qs[start:end]






# ------------------------------------------------
# 1) Interviewer Wallet Summary
# ------------------------------------------------
class InterviewerWalletSummaryAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        wallet = TokenService.get_or_create_wallet(request.user)

        data = {
            "total_balance": wallet.balance + wallet.locked_balance,
            "locked_balance": wallet.locked_balance,
            "available_balance": wallet.balance - wallet.locked_balance,
        }

        serializer = InterviewerWalletSummarySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    



# ------------------------------------------------
#  Interviewer Wallet Transactions (Ledger)
# ------------------------------------------------
class InterviewerWalletTransactionsAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        wallet = TokenService.get_or_create_wallet(request.user)

        tx_type = request.query_params.get("type")  # optional filter

        qs = TokenTransaction.objects.filter(wallet=wallet).order_by("-created_at")

        if tx_type:
            qs = qs.filter(transaction_type=tx_type)

        page, page_size, total, results = paginate_queryset(qs, request)

        serializer = InterviewerWalletTransactionSerializer(results, many=True)

        return Response(
            {
                "count": total,
                "page": page,
                "page_size": page_size,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    




# ------------------------------------------------
# 3) Interviewer Earnings Summary (Dashboard)
# ------------------------------------------------
class InterviewerEarningsAPIView(APIView):
    """
    Used for interviewer dashboard earnings insight.
    """
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        interviewer = request.user
        wallet = TokenService.get_or_create_wallet(interviewer)

        qs = TokenTransaction.objects.filter(wallet=wallet)

        tokens_earned_total = (
            qs.filter(transaction_type=TokenTransactionType.SESSION_EARN)
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        now = timezone.now()
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)

        earnings_last_7_days = (
            qs.filter(
                transaction_type=TokenTransactionType.SESSION_EARN,
                created_at__gte=last_7_days,
            )
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        earnings_last_30_days = (
            qs.filter(
                transaction_type=TokenTransactionType.SESSION_EARN,
                created_at__gte=last_30_days,
            )
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        completed_sessions_count = (
            InterviewBooking.objects.filter(
                interviewer=interviewer,
                status=InterviewBooking.Status.COMPLETED,
            ).count()
        )

        data = {
            "tokens_earned_total": tokens_earned_total,
            "earnings_last_7_days": earnings_last_7_days,
            "earnings_last_30_days": earnings_last_30_days,
            "completed_sessions_count": completed_sessions_count,
        }

        serializer = InterviewerEarningsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    




# ------------------------------------------------
# 4) Interviewer Wallet Stats (Optional: full breakdown)
# ------------------------------------------------
class InterviewerWalletStatsAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        wallet = TokenService.get_or_create_wallet(request.user)

        qs = TokenTransaction.objects.filter(wallet=wallet)

        purchased_total = (
            qs.filter(transaction_type=TokenTransactionType.TOKEN_PURCHASE)
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        earned_total = (
            qs.filter(transaction_type=TokenTransactionType.SESSION_EARN)
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        refunded_total = (
            qs.filter(transaction_type=TokenTransactionType.REFUND)
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        # spent tokens would usually not happen for interviewers
        spent_total = (
            qs.filter(transaction_type=TokenTransactionType.SESSION_SPEND)
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )
        spent_total = abs(spent_total)

        data = {
            "tokens_purchased_total": purchased_total,
            "tokens_earned_total": earned_total,
            "tokens_spent_total": spent_total,
            "tokens_refunded_total": refunded_total,
            "tokens_locked_now": wallet.locked_balance,
            "transactions_count": qs.count(),
        }

        serializer = InterviewerWalletStatsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)





# ------------------------------------------------
# 5) Interviewer Earnings Transactions Only (Optional)
# ------------------------------------------------
class InterviewerEarningTransactionsAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        wallet = TokenService.get_or_create_wallet(request.user)

        qs = (
            TokenTransaction.objects
            .filter(
                wallet=wallet,
                transaction_type=TokenTransactionType.SESSION_EARN,
            )
            .order_by("-created_at")
        )

        page, page_size, total, results = paginate_queryset(qs, request)

        serializer = InterviewerWalletTransactionSerializer(results, many=True)

        return Response(
            {
                "count": total,
                "page": page,
                "page_size": page_size,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )