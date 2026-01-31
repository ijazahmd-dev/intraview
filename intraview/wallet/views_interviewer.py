from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.conf import settings

from authentication.authentication import InterviewerCookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer

from .models import TokenTransaction, TokenTransactionType, PayoutRequest, PayoutRequestStatus
from .services import TokenService
from bookings.models import InterviewBooking

from .serializers import (
    InterviewerWalletSummarySerializer,
    InterviewerWalletTransactionSerializer,
    InterviewerWalletStatsSerializer,
    InterviewerEarningsSerializer,
    PayoutRequestSerializer
)

from wallet._services.payout_service import PayoutService












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
    






class StandardPagination(PageNumberPagination):
    """Simple pagination for payout lists"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


# ============================================
# INTERVIEWER PAYOUT ENDPOINTS
# ============================================

class InterviewerPayoutRequestCreateAPIView(APIView):
    """
    POST /api/wallet/payouts/request/
    
    Create a new payout request.
    Tokens are LOCKED immediately upon creation.
    """
    
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]
    
    def post(self, request):
        """
        Create payout request
        
        Request body:
        {
            "tokens_requested": 100,
            "bank_account_number": "123456789012345678",
            "ifsc_code": "SBIN0001234",
            "account_holder_name": "John Doe",
            "mobile_number": "9876543210"
        }
        
        Response 201:
        {
            "message": "Payout request created successfully!",
            "reference_number": "PAY-2026-A3F8B2C1",
            "payout": {
                "id": 1,
                "reference_number": "PAY-2026-A3F8B2C1",
                "status": "REQUESTED",
                "tokens_requested": 100,
                "amount_inr": "1000.00",
                "masked_account": "****5678",
                ...
            }
        }
        
        Response 400 (errors):
        {
            "error": "Validation failed",
            "details": "Insufficient balance. Need: 100, Available: 50"
        }
        """
        
        # Serializer handles initial validation
        serializer = PayoutRequestSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Invalid input",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create payout request using service layer
            # This will:
            # 1. Validate all business rules
            # 2. Lock tokens in wallet
            # 3. Create payout request
            # 4. Create transaction log
            payout = PayoutService.create_request(
                interviewer=request.user,
                tokens_requested=serializer.validated_data['tokens_requested'],
                bank_details={
                    'bank_account_number': serializer.validated_data['bank_account_number'],
                    'ifsc_code': serializer.validated_data['ifsc_code'],
                    'account_holder_name': serializer.validated_data['account_holder_name'],
                    'mobile_number': serializer.validated_data['mobile_number'],
                }
            )
            
            # Return created payout with full details
            response_serializer = PayoutRequestSerializer(payout)
            
            return Response(
                {
                    "message": "Payout request created successfully!",
                    "reference_number": payout.reference_number,
                    "payout": response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        
        except ValueError as e:
            # Business logic validation failed
            return Response(
                {
                    "error": "Validation failed",
                    "details": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Unexpected error
            return Response(
                {
                    "error": "Internal server error",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InterviewerPayoutListAPIView(APIView):
    """
    GET /api/wallet/payouts/
    
    List interviewer's payout requests with pagination and filtering.
    """
    
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]
    
    def get(self, request):
        """
        List payout requests
        
        Query params:
        - status: REQUESTED | APPROVED | PAID | REJECTED (optional)
        - page: 1 (default)
        - page_size: 10 (default, max 50)
        
        Response:
        {
            "count": 5,
            "next": "http://...?page=2",
            "previous": null,
            "results": [
                {
                    "id": 1,
                    "reference_number": "PAY-2026-A3F8B2C1",
                    "status": "REQUESTED",
                    "status_display": "Pending Review",
                    "tokens_requested": 100,
                    "amount_inr": "1000.00",
                    "requested_at": "2026-01-30T12:00:00Z",
                    ...
                }
            ]
        }
        """
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        
        # Validate status if provided
        if status_filter and status_filter not in PayoutRequestStatus.values:
            return Response(
                {
                    "error": "Invalid status",
                    "valid_statuses": PayoutRequestStatus.values
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get payouts using service layer
        payouts = PayoutService.get_interviewer_payouts(
            interviewer=request.user,
            status=status_filter
        )
        
        # Paginate
        paginator = StandardPagination()
        page = paginator.paginate_queryset(payouts, request)
        
        if page is not None:
            serializer = PayoutRequestSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        # No pagination needed (small dataset)
        serializer = PayoutRequestSerializer(payouts, many=True)
        return Response({
            "count": payouts.count(),
            "results": serializer.data
        })


class InterviewerPayoutDetailAPIView(APIView):
    """
    GET /api/wallet/payouts/{id}/
    
    Get details of a specific payout request.
    """
    
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]
    
    def get(self, request, payout_id):
        """
        Get payout details
        
        Response 200:
        {
            "id": 1,
            "reference_number": "PAY-2026-A3F8B2C1",
            "status": "REQUESTED",
            "status_display": "Pending Review",
            "masked_account": "****5678",
            "amount_inr": "1000.00",
            "tokens_requested": 100,
            "token_rate_snapshot": "10.00",
            "requested_at": "2026-01-30T12:00:00Z",
            "admin_notes": "",
            "rejection_reason": "",
            ...
        }
        
        Response 404:
        {
            "error": "Payout request not found"
        }
        """
        
        try:
            payout = PayoutRequest.objects.select_related('processed_by').get(
                id=payout_id,
                interviewer=request.user
            )
            
            serializer = PayoutRequestSerializer(payout)
            return Response(serializer.data)
        
        except PayoutRequest.DoesNotExist:
            return Response(
                {
                    "error": "Payout request not found",
                    "details": f"No payout found with ID {payout_id}"
                },
                status=status.HTTP_404_NOT_FOUND
            )


class InterviewerPayoutStatsAPIView(APIView):
    """
    GET /api/wallet/payouts/stats/
    
    Get payout statistics for interviewer dashboard.
    """
    
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]
    
    def get(self, request):
        """
        Get payout statistics
        
        Response:
        {
            "total_tokens_requested": 500,
            "total_tokens_paid": 300,
            "total_amount_paid_inr": 3000.0,
            "pending_count": 1,
            "completed_count": 3,
            "rejected_count": 0
        }
        """
        
        stats = PayoutService.get_payout_stats(request.user)
        
        return Response(stats)


class InterviewerPayoutEligibilityCheckAPIView(APIView):
    """
    GET /api/wallet/payouts/eligibility/
    
    Check if interviewer can request payout.
    Shows wallet balance, verification status, active payout status.
    """
    
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]
    
    def get(self, request):
        """
        Check payout eligibility
        
        Response:
        {
            "can_request": true,
            "wallet_balance": {
                "total": 150,
                "available": 120,
                "locked": 30
            },
            "verification_status": "APPROVED",
            "active_payout": null,
            "min_tokens_required": 50,
            "current_rate": "10.00",
            "reasons": []
        }
        
        If cannot request:
        {
            "can_request": false,
            "reasons": [
                "Verification status: PENDING. Must be APPROVED.",
                "You already have an active payout request."
            ],
            ...
        }
        """
        
        # Get wallet
        try:
            wallet = request.user.token_wallet
        except:
            return Response({
                "can_request": False,
                "error": "Wallet not found",
                "reasons": ["Token wallet not initialized. Please contact support."]
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check verification
        try:
            verification_status = request.user.interviewer_profile.verification.status
        except:
            verification_status = "UNKNOWN"
        
        # Check active payout
        active_payout = PayoutRequest.objects.filter(
            interviewer=request.user,
            status__in=[PayoutRequestStatus.REQUESTED, PayoutRequestStatus.APPROVED]
        ).first()
        
        # Calculate available balance
        available = TokenService.get_available_balance(wallet)
        min_tokens = getattr(settings, 'PAYOUT_MIN_TOKENS', 50)
        current_rate = PayoutService.get_current_rate()
        
        # Determine eligibility with reasons
        reasons = []
        can_request = True
        
        if verification_status != "APPROVED":
            can_request = False
            reasons.append(f"Verification status: {verification_status}. Must be APPROVED.")
        
        if active_payout:
            can_request = False
            reasons.append(f"You already have an active payout request ({active_payout.reference_number}).")
        
        if available < min_tokens:
            can_request = False
            reasons.append(f"Insufficient balance. Need at least {min_tokens} tokens, you have {available} available.")
        
        response = {
            "can_request": can_request,
            "wallet_balance": {
                "total": wallet.balance,
                "available": available,
                "locked": wallet.locked_balance
            },
            "verification_status": verification_status,
            "active_payout": {
                "reference_number": active_payout.reference_number,
                "status": active_payout.status,
                "tokens_requested": active_payout.tokens_requested
            } if active_payout else None,
            "min_tokens_required": min_tokens,
            "current_rate": str(current_rate),
            "reasons": reasons if not can_request else []
        }
        
        return Response(response)
