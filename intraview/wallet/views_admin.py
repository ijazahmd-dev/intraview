import csv
from django.http import HttpResponse
from django.db import models

from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.conf import settings

from .models import TokenTransaction, TokenWallet
from .serializers import AdminTokenWalletSerializer, AdminTokenTransactionSerializer, TokenWalletFilter, TokenTransactionFilter, AdminWalletStatsSerializer 
from .pagination import AdminWalletPagination
from .models import PayoutRequest, PayoutRequestStatus
from .serializers import PayoutRequestSerializer
from ._services.payout_service import PayoutService

from authentication.authentication import AdminCookieJWTAuthentication
from authentication.permissions import IsAdminRole



class AdminTokenWalletListAPIView(generics.ListAPIView):
    """
    Admin API to list token wallets (read-only).
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

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
    permission_classes = [IsAuthenticated, IsAdminRole]

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
    permission_classes = [IsAuthenticated, IsAdminRole]

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
    permission_classes = [IsAuthenticated, IsAdminRole]

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








class AdminPagination(PageNumberPagination):
    """Pagination for admin payout lists"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ============================================
# ADMIN PAYOUT MANAGEMENT ENDPOINTS
# ============================================

class AdminPayoutQueueAPIView(APIView):
    """
    GET /api/admin/payouts/queue/
    
    List all pending payout requests (REQUESTED + APPROVED).
    Admin dashboard view.
    """
    
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        """
        Get payout queue
        
        Query params:
        - status: REQUESTED | APPROVED | ALL (optional, default: pending only)
        - page: 1
        - page_size: 20
        - search: reference_number or username (optional)
        
        Response:
        {
            "count": 15,
            "next": "...",
            "previous": null,
            "results": [
                {
                    "id": 1,
                    "reference_number": "PAY-2026-A3F8B2C1",
                    "interviewer_name": "John Doe",
                    "interviewer_username": "johndoe",
                    "status": "REQUESTED",
                    "tokens_requested": 100,
                    "amount_inr": "1000.00",
                    "requested_at": "2026-01-30T12:00:00Z",
                    ...
                }
            ]
        }
        """
        
        # Get filter parameters
        status_filter = request.query_params.get('status', 'pending')
        search_query = request.query_params.get('search', '').strip()
        
        # Get payouts based on status
        if status_filter == 'ALL':
            payouts = PayoutRequest.objects.all()
        elif status_filter in PayoutRequestStatus.values:
            payouts = PayoutRequest.objects.filter(status=status_filter)
        else:
            # Default: pending payouts only
            payouts = PayoutService.get_pending_payouts()
        
        # Apply search filter
        if search_query:
            payouts = payouts.filter(
                models.Q(reference_number__icontains=search_query) |
                models.Q(interviewer__username__icontains=search_query) |
                models.Q(interviewer__interviewer_profile__display_name__icontains=search_query)
            )
        
        # Order by priority: REQUESTED first, then by date
        payouts = payouts.select_related(
            'interviewer',
            'interviewer__interviewer_profile',
            'processed_by'
        ).order_by(
            models.Case(
                models.When(status=PayoutRequestStatus.REQUESTED, then=0),
                models.When(status=PayoutRequestStatus.APPROVED, then=1),
                default=2
            ),
            '-requested_at'
        )
        
        # Paginate
        paginator = AdminPagination()
        page = paginator.paginate_queryset(payouts, request)
        
        if page is not None:
            serializer = PayoutRequestSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        # No pagination
        serializer = PayoutRequestSerializer(payouts, many=True)
        return Response({
            "count": payouts.count(),
            "results": serializer.data
        })


class AdminPayoutDetailAPIView(APIView):
    """
    GET /api/admin/payouts/{id}/
    
    Get detailed payout information (admin view with full bank details).
    """
    
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request, payout_id):
        """
        Get payout details
        
        Response 200:
        {
            "id": 1,
            "reference_number": "PAY-2026-A3F8B2C1",
            "interviewer": 5,
            "interviewer_name": "John Doe",
            "interviewer_username": "johndoe",
            "status": "REQUESTED",
            "status_display": "Pending Review",
            "tokens_requested": 100,
            "amount_inr": "1000.00",
            "token_rate_snapshot": "10.00",
            "bank_account_number": "123456789012",  # Full number (admin only)
            "ifsc_code": "SBIN0001234",
            "account_holder_name": "John Doe",
            "mobile_number": "9876543210",
            "verification_id_snapshot": "VER-123",
            "verification_status_snapshot": "APPROVED",
            "requested_at": "2026-01-30T12:00:00Z",
            "admin_notes": "",
            "rejection_reason": "",
            "processed_by": null,
            "paid_at": null,
            ...
        }
        
        Response 404:
        {
            "error": "Payout request not found"
        }
        """
        
        try:
            payout = PayoutRequest.objects.select_related(
                'interviewer',
                'interviewer__interviewer_profile',
                'processed_by'
            ).get(id=payout_id)
            
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


# class AdminPayoutActionAPIView(APIView):
#     """
#     PATCH /api/admin/payouts/{id}/action/
    
#     Single endpoint for all admin actions:
#     - approve
#     - reject
#     - mark_paid
    
#     Simplified admin workflow.
#     """
    
#     authentication_classes = [AdminCookieJWTAuthentication]
#     permission_classes = [IsAuthenticated, IsAdminRole]
    
#     def patch(self, request, payout_id):
#         """
#         Perform admin action on payout
        
#         Request body:
#         {
#             "action": "approve" | "reject" | "mark_paid",
#             "notes": "Optional admin notes",
#             "rejection_reason": "Required if action=reject"
#         }
        
#         Response 200:
#         {
#             "message": "Payout approved successfully",
#             "payout": {
#                 "id": 1,
#                 "reference_number": "PAY-2026-A3F8B2C1",
#                 "status": "APPROVED",
#                 ...
#             }
#         }
        
#         Response 400:
#         {
#             "error": "Invalid action",
#             "details": "..."
#         }
#         """
        
#         # Validate action
#         action = request.data.get('action')
#         valid_actions = ['approve', 'reject', 'mark_paid']
        
#         if not action or action not in valid_actions:
#             return Response(
#                 {
#                     "error": "Invalid action",
#                     "details": f"Action must be one of: {', '.join(valid_actions)}",
#                     "valid_actions": valid_actions
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Get optional fields
#         notes = request.data.get('notes', '').strip()
#         rejection_reason = request.data.get('rejection_reason', '').strip()
        
#         # Validate rejection reason
#         if action == 'reject' and not rejection_reason:
#             return Response(
#                 {
#                     "error": "Rejection reason required",
#                     "details": "You must provide a rejection_reason when rejecting a payout"
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             # Execute action using service layer
#             if action == 'approve':
#                 payout = PayoutService.approve(
#                     payout_id=payout_id,
#                     admin_user=request.user,
#                     notes=notes
#                 )
#                 message = f"Payout {payout.reference_number} approved successfully"
            
#             elif action == 'reject':
#                 payout = PayoutService.reject(
#                     payout_id=payout_id,
#                     admin_user=request.user,
#                     rejection_reason=rejection_reason
#                 )
#                 message = f"Payout {payout.reference_number} rejected"
            
#             elif action == 'mark_paid':
#                 payout = PayoutService.mark_paid(
#                     payout_id=payout_id,
#                     admin_user=request.user,
#                     notes=notes
#                 )
#                 message = f"Payout {payout.reference_number} marked as paid"
            
#             # Return updated payout
#             serializer = PayoutRequestSerializer(payout)
            
#             return Response(
#                 {
#                     "message": message,
#                     "payout": serializer.data
#                 },
#                 status=status.HTTP_200_OK
#             )
        
#         except ValueError as e:
#             # Business logic error
#             return Response(
#                 {
#                     "error": "Action failed",
#                     "details": str(e)
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             # Unexpected error
#             return Response(
#                 {
#                     "error": "Internal server error",
#                     "details": str(e)
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


class AdminPayoutApproveAPIView(APIView):
    """
    POST /api/admin/payouts/{id}/approve/
    
    Approve a payout request (REQUESTED → APPROVED).
    Alternative dedicated endpoint for approve action.
    """
    
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def post(self, request, payout_id):
        """
        Approve payout
        
        Request body:
        {
            "notes": "Verified bank details. Approved for payment."
        }
        
        Response 200:
        {
            "message": "Payout PAY-2026-A3F8B2C1 approved successfully",
            "payout": {...}
        }
        """
        
        notes = request.data.get('notes', '').strip()
        
        try:
            payout = PayoutService.approve(
                payout_id=payout_id,
                admin_user=request.user,
                notes=notes
            )
            
            serializer = PayoutRequestSerializer(payout)
            
            return Response(
                {
                    "message": f"Payout {payout.reference_number} approved successfully",
                    "payout": serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        except ValueError as e:
            return Response(
                {
                    "error": "Approval failed",
                    "details": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminPayoutRejectAPIView(APIView):
    """
    POST /api/admin/payouts/{id}/reject/
    
    Reject a payout request (REQUESTED/APPROVED → REJECTED).
    Unlocks tokens in wallet.
    """
    
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def post(self, request, payout_id):
        """
        Reject payout
        
        Request body:
        {
            "rejection_reason": "Invalid bank details. Please verify IFSC code."
        }
        
        Response 200:
        {
            "message": "Payout PAY-2026-A3F8B2C1 rejected",
            "payout": {...}
        }
        """
        
        rejection_reason = request.data.get('rejection_reason', '').strip()
        
        if not rejection_reason:
            return Response(
                {
                    "error": "Rejection reason required",
                    "details": "You must provide a rejection_reason"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            payout = PayoutService.reject(
                payout_id=payout_id,
                admin_user=request.user,
                rejection_reason=rejection_reason
            )
            
            serializer = PayoutRequestSerializer(payout)
            
            return Response(
                {
                    "message": f"Payout {payout.reference_number} rejected",
                    "payout": serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        except ValueError as e:
            return Response(
                {
                    "error": "Rejection failed",
                    "details": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminPayoutMarkPaidAPIView(APIView):
    """
    POST /api/admin/payouts/{id}/mark-paid/
    
    Mark payout as PAID (APPROVED → PAID).
    CRITICAL: Deducts tokens from wallet.
    """
    
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def post(self, request, payout_id):
        """
        Mark payout as paid
        
        Request body:
        {
            "notes": "Paid via NEFT on 2026-01-30. UTR: 123456789012"
        }
        
        Response 200:
        {
            "message": "Payout PAY-2026-A3F8B2C1 marked as paid",
            "payout": {...}
        }
        """
        
        notes = request.data.get('notes', '').strip()
        
        try:
            payout = PayoutService.mark_paid(
                payout_id=payout_id,
                admin_user=request.user,
                notes=notes
            )
            
            serializer = PayoutRequestSerializer(payout)
            
            return Response(
                {
                    "message": f"Payout {payout.reference_number} marked as paid",
                    "payout": serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        except ValueError as e:
            return Response(
                {
                    "error": "Mark paid failed",
                    "details": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminPayoutStatsAPIView(APIView):
    """
    GET /api/admin/payouts/stats/
    
    Get overall payout statistics for admin dashboard.
    """
    
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        """
        Get payout statistics
        """
        from django.db.models import Sum, Count, Q
        from django.utils import timezone
        
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        stats = PayoutRequest.objects.aggregate(
            total_payouts=Count('id'),
            
            # Pending counts (Only 'REQUESTED' for the Queue view)
            pending_count=Count('id', filter=Q(status=PayoutRequestStatus.REQUESTED)),
            
            # Pending amount (Only 'REQUESTED' so it matches the table)
            pending_amount=Sum('amount_inr', filter=Q(status=PayoutRequestStatus.REQUESTED)),
            
            # Paid calculations for this month
            paid_count_this_month=Count('id', filter=Q(status=PayoutRequestStatus.PAID, updated_at__gte=start_of_month)),
            paid_this_month=Sum('amount_inr', filter=Q(status=PayoutRequestStatus.PAID, updated_at__gte=start_of_month)),
            
            # Rejected calculations for this month
            rejected_count_this_month=Count('id', filter=Q(status=PayoutRequestStatus.REJECTED, updated_at__gte=start_of_month))
        )
        
        # Handle None values
        return Response({
            "total_payouts": stats['total_payouts'] or 0,
            "pending_count": stats['pending_count'] or 0,
            "pending_amount": float(stats['pending_amount'] or 0),
            "paid_count_this_month": stats['paid_count_this_month'] or 0,
            "paid_this_month": float(stats['paid_this_month'] or 0),
            "rejected_count_this_month": stats['rejected_count_this_month'] or 0,
        })


class AdminPayoutHistoryAPIView(APIView):
    """
    GET /api/admin/payouts/history/
    
    Get complete payout history with filtering.
    """
    
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        """
        Get payout history
        
        Query params:
        - status: PAID | REJECTED (optional)
        - interviewer_id: filter by interviewer (optional)
        - from_date: YYYY-MM-DD (optional)
        - to_date: YYYY-MM-DD (optional)
        - page: 1
        - page_size: 20
        
        Response:
        {
            "count": 120,
            "next": "...",
            "previous": null,
            "results": [...]
        }
        """
        
        from django.db.models import Q
        from datetime import datetime
        
        # Base queryset
        payouts = PayoutRequest.objects.select_related(
            'interviewer',
            'interviewer__interviewer_profile',
            'processed_by'
        )
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter and status_filter in PayoutRequestStatus.values:
            payouts = payouts.filter(status=status_filter)
        
        # Filter by interviewer
        interviewer_id = request.query_params.get('interviewer_id')
        if interviewer_id:
            payouts = payouts.filter(interviewer_id=interviewer_id)
        
        # Filter by date range
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        
        if from_date:
            try:
                from_date_obj = datetime.strptime(from_date, '%Y-%m-%d')
                payouts = payouts.filter(requested_at__gte=from_date_obj)
            except ValueError:
                pass
        
        if to_date:
            try:
                to_date_obj = datetime.strptime(to_date, '%Y-%m-%d')
                payouts = payouts.filter(requested_at__lte=to_date_obj)
            except ValueError:
                pass
        
        # Order by date
        payouts = payouts.order_by('-requested_at')
        
        # Paginate
        paginator = AdminPagination()
        page = paginator.paginate_queryset(payouts, request)
        
        if page is not None:
            serializer = PayoutRequestSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = PayoutRequestSerializer(payouts, many=True)
        return Response({
            "count": payouts.count(),
            "results": serializer.data
        })

        






                                        
                            
            
            


