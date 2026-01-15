from django.shortcuts import render
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import TokenWallet, TokenTransaction, TokenTransactionType
from .services import TokenService
from .serializers import (
    CandidateWalletSummarySerializer,
    CandidateWalletTransactionSerializer,
    CandidateWalletStatsSerializer,
)
from authentication.authentication import CookieJWTAuthentication


# Create your views here.




class CandidateWalletSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        wallet = TokenService.get_or_create_wallet(request.user)

        data = {
            "total_balance": wallet.balance + wallet.locked_balance,
            "locked_balance": wallet.locked_balance,
            "available_balance": wallet.balance - wallet.locked_balance,
        }

        serializer = CandidateWalletSummarySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)









class CandidateWalletTransactionsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        wallet = TokenService.get_or_create_wallet(request.user)

        tx_type = request.query_params.get("type")  # optional filter

        qs = TokenTransaction.objects.filter(wallet=wallet).order_by("-created_at")

        if tx_type:
            qs = qs.filter(transaction_type=tx_type)

        # Simple pagination (manual, lightweight)
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))

        start = (page - 1) * page_size
        end = start + page_size

        total = qs.count()
        results = qs[start:end]

        serializer = CandidateWalletTransactionSerializer(results, many=True)

        return Response(
            {
                "count": total,
                "page": page,
                "page_size": page_size,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )




class CandidateWalletStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        wallet = TokenService.get_or_create_wallet(request.user)

        qs = TokenTransaction.objects.filter(wallet=wallet)

        purchased_total = (
            qs.filter(transaction_type=TokenTransactionType.TOKEN_PURCHASE)
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        refunded_total = (
            qs.filter(transaction_type=TokenTransactionType.REFUND)
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        # Tokens spent: SESSION_SPEND is typically negative
        spent_total = (
            qs.filter(transaction_type=TokenTransactionType.SESSION_SPEND)
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )
        spent_total = abs(spent_total)

        data = {
            "tokens_purchased_total": purchased_total,
            "tokens_spent_total": spent_total,
            "tokens_refunded_total": refunded_total,
            "tokens_locked_now": wallet.locked_balance,
            "transactions_count": qs.count(),
        }

        serializer = CandidateWalletStatsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)