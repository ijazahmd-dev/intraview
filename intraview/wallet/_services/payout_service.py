from decimal import Decimal
from django.db import transaction, models
from django.utils import timezone
from django.conf import settings
import uuid

from wallet.models import (
    PayoutRequest,
    PayoutRequestStatus,
    TokenWallet,
    TokenTransaction,
    TokenTransactionType,
)

from interviewers.models import VerificationStatus
from wallet.services import TokenService




from wallet.models import (
    PayoutRequest,
    PayoutRequestStatus,
    TokenWallet,
    TokenTransaction,
    TokenTransactionType,
)


class PayoutService:
    """
    Core business logic for payout operations.
    All database operations are atomic and safe.
    
    CRITICAL FINANCIAL FLOWS:
    - REQUESTED: Lock tokens in wallet
    - REJECTED: Unlock tokens in wallet
    - PAID: Deduct tokens from wallet (already locked)
    """
    
    # ====================================
    # UTILITY METHODS
    # ====================================
    
    @staticmethod
    def generate_reference():
        """
        Generate unique reference using UUID (safe from race conditions).
        Format: PAY-2026-A3F8B2C1
        
        Returns: str
        """
        prefix = getattr(settings, 'PAYOUT_REFERENCE_PREFIX', 'PAY')
        year = timezone.now().year
        unique_id = uuid.uuid4().hex[:8].upper()
        
        return f"{prefix}-{year}-{unique_id}"
    
    @staticmethod
    def get_current_rate():
        """
        Get current token to INR rate.
        Returns: Decimal (e.g., Decimal('10.00'))
        """
        return Decimal(getattr(settings, 'PAYOUT_RATE_PER_TOKEN', '10.00'))
    
    # ====================================
    # ELIGIBILITY CHECKS
    # ====================================
    
    @staticmethod
    def check_verification(interviewer):
        """
        Check if interviewer is verified.
        Returns: (bool, str or None, verification_data or None)
        """
        try:
            verification = interviewer.interviewer_profile.verification
            
            if verification.status != 'APPROVED':
                return False, f"Verification status: {verification.status}. Must be APPROVED.", None
            
            verification_data = {
                'id': str(verification.id),
                'status': verification.status
            }
            
            return True, None, verification_data
        
        except AttributeError:
            return False, "Verification record not found. Please complete verification first.", None
        except Exception as e:
            return False, f"Verification check failed: {str(e)}", None
    
    @staticmethod
    def check_active_payout(interviewer):
        """
        Check if interviewer has an active payout request.
        Returns: (bool, str or None)
        """
        active = PayoutRequest.objects.filter(
            interviewer=interviewer,
            status__in=[
                PayoutRequestStatus.REQUESTED,
                PayoutRequestStatus.APPROVED
            ]
        ).exists()
        
        if active:
            return False, "You already have an active payout request. Please wait for it to complete."
        
        return True, None
    
    @staticmethod
    def check_wallet_balance(interviewer, tokens_needed):
        """
        ⭐ FIXED: Single source of truth - wallet only.
        Check if wallet has sufficient AVAILABLE balance.
        
        Available = balance - locked_balance
        
        Returns: (bool, str or None, wallet or None)
        """
        try:
            wallet = interviewer.token_wallet
        except TokenWallet.DoesNotExist:
            return False, "Wallet not found. Please contact support.", None
        
        # ✅ CLEAN: Single calculation, no aggregate
        available = wallet.balance - wallet.locked_balance
        
        if available < tokens_needed:
            return (
                False,
                f"Insufficient balance. Need: {tokens_needed}, Available: {available}",
                wallet
            )
        
        return True, None, wallet
    
    @staticmethod
    def check_min_tokens(tokens_requested):
        """
        Check if tokens meet minimum requirement.
        Returns: (bool, str or None)
        """
        min_tokens = getattr(settings, 'PAYOUT_MIN_TOKENS', 50)
        
        if tokens_requested < min_tokens:
            return (
                False,
                f"Minimum {min_tokens} tokens required. You requested {tokens_requested}."
            )
        
        return True, None
    
    # ====================================
    # MAIN OPERATIONS
    # ====================================
    
    @staticmethod
    @transaction.atomic
    def create_request(interviewer, tokens_requested, bank_details):
        """
        ⭐ UPDATED: Create payout request AND lock tokens atomically.
        
        Args:
            interviewer: User instance
            tokens_requested: int
            bank_details: dict {
                'bank_account_number': str,
                'ifsc_code': str,
                'account_holder_name': str,
                'mobile_number': str
            }
        
        Returns:
            PayoutRequest instance
        
        Raises:
            ValueError: If any validation fails
        """
        
        # ========== CHECK 1: Token minimum ==========
        valid, error = PayoutService.check_min_tokens(tokens_requested)
        if not valid:
            raise ValueError(error)
        
        # ========== CHECK 2: Verification ==========
        valid, error, verification_data = PayoutService.check_verification(interviewer)
        if not valid:
            raise ValueError(error)
        
        # ========== CHECK 3: Active payout ==========
        valid, error = PayoutService.check_active_payout(interviewer)
        if not valid:
            raise ValueError(error)
        
        # ========== CHECK 4: Wallet balance ==========
        valid, error, wallet = PayoutService.check_wallet_balance(
            interviewer, tokens_requested
        )
        if not valid:
            raise ValueError(error)
        
        # ========== CALCULATE AMOUNT ==========
        rate = PayoutService.get_current_rate()
        amount_inr = Decimal(tokens_requested) * rate
        
        # ========== LOCK TOKENS IN WALLET (CRITICAL) ==========
        wallet = TokenWallet.objects.select_for_update().get(
            user=interviewer
        )

        # ========== GENERATE REFERENCE ==========
        reference = PayoutService.generate_reference()        
        
        TokenService.lock_tokens(
            wallet=wallet,
            amount=tokens_requested,
            transaction_type=TokenTransactionType.PAYOUT_LOCK,
            reference_id=reference,
            note=f"Payout request {reference} - tokens locked"
        )
        

        
        # ========== CREATE PAYOUT REQUEST ==========
        payout = PayoutRequest.objects.create(
            interviewer=interviewer,
            reference_number=reference,
            tokens_requested=tokens_requested,
            amount_inr=amount_inr,
            token_rate_snapshot=rate,
            bank_account_number=bank_details['bank_account_number'],
            ifsc_code=bank_details['ifsc_code'].upper(),
            account_holder_name=bank_details['account_holder_name'],
            mobile_number=bank_details['mobile_number'],
            status=PayoutRequestStatus.REQUESTED,
            verification_id_snapshot=verification_data.get('id', ''),
            verification_status_snapshot=verification_data.get('status', ''),
        )
        
        return payout
    
    # ====================================
    # ADMIN OPERATIONS
    # ====================================
    
    @staticmethod
    @transaction.atomic
    def approve(payout_id, admin_user, notes=''):
        """
        Approve a payout request for payment.
        Moves from REQUESTED → APPROVED
        
        Args:
            payout_id: int
            admin_user: User instance (the admin)
            notes: str (optional admin notes)
        
        Returns:
            PayoutRequest instance
        
        Raises:
            ValueError: If payout cannot be approved
        """
        
        try:
            payout = PayoutRequest.objects.select_for_update().get(id=payout_id)
        except PayoutRequest.DoesNotExist:
            raise ValueError("Payout request not found")
        
        # Check current status
        if payout.status != PayoutRequestStatus.REQUESTED:
            raise ValueError(
                f"Can only approve REQUESTED payouts. Current status: {payout.get_status_display()}"
            )
        
        # Update status
        payout.status = PayoutRequestStatus.APPROVED
        payout.admin_notes = notes
        payout.processed_by = admin_user
        payout.save(update_fields=['status', 'admin_notes', 'processed_by', 'updated_at'])
        
        return payout
    
    @staticmethod
    @transaction.atomic
    def reject(payout_id, admin_user, rejection_reason=''):
        """
        ⭐ UPDATED: Reject payout AND unlock tokens.
        
        Args:
            payout_id: int
            admin_user: User instance (the admin)
            rejection_reason: str
        
        Returns:
            PayoutRequest instance
        
        Raises:
            ValueError: If payout cannot be rejected
        """
        
        try:
            payout = PayoutRequest.objects.select_for_update().get(id=payout_id)
        except PayoutRequest.DoesNotExist:
            raise ValueError("Payout request not found")
        
        # Check if can be rejected
        if payout.status not in [PayoutRequestStatus.REQUESTED, PayoutRequestStatus.APPROVED]:
            raise ValueError(
                f"Cannot reject {payout.get_status_display()} payouts"
            )
        
        # ========== UNLOCK TOKENS (CRITICAL) ==========
        wallet = TokenWallet.objects.select_for_update().get(
            user=payout.interviewer
        )
        
        TokenService.unlock_tokens(
            wallet=wallet,
            amount=payout.tokens_requested,
            transaction_type=TokenTransactionType.PAYOUT_UNLOCK,
            reference_id=payout.reference_number,
            note=f"Payout {payout.reference_number} rejected"
        )
        
        # ========== UPDATE PAYOUT STATUS ==========
        payout.status = PayoutRequestStatus.REJECTED
        payout.rejection_reason = rejection_reason
        payout.processed_by = admin_user
        payout.save(update_fields=['status', 'rejection_reason', 'processed_by', 'updated_at'])
        
        return payout
    
    @staticmethod
    @transaction.atomic
    def mark_paid(payout_id, admin_user, notes=''):
        """
        ⭐ UPDATED: Mark payout as PAID - deduct tokens (already locked).
        
        CRITICAL: Tokens were locked on REQUESTED.
        Now we:
        1. Deduct from balance
        2. Unlock from locked_balance
        3. Create ledger entry
        
        Args:
            payout_id: int
            admin_user: User instance (the admin)
            notes: str (optional processing notes)
        
        Returns:
            PayoutRequest instance (updated)
        
        Raises:
            ValueError: If operation cannot be completed
        """
        
        # ========== FETCH PAYOUT WITH LOCK ==========
        try:
            payout = PayoutRequest.objects.select_for_update().get(id=payout_id)
        except PayoutRequest.DoesNotExist:
            raise ValueError("Payout request not found")
        
        # ========== CHECK STATUS ==========
        if payout.status != PayoutRequestStatus.APPROVED:
            raise ValueError(
                f"Can only mark APPROVED as paid. Current: {payout.get_status_display()}"
            )
        
        # ========== GET WALLET WITH LOCK ==========
        try:
            wallet = TokenWallet.objects.select_for_update().get(
                user=payout.interviewer
            )
        except TokenWallet.DoesNotExist:
            raise ValueError(f"Wallet not found for {payout.interviewer}")
        
        # ========== SAFETY CHECK ==========
        if wallet.locked_balance < payout.tokens_requested:
            raise ValueError(
                f"Locked balance mismatch. "
                f"Need: {payout.tokens_requested}, Locked: {wallet.locked_balance}"
            )
        
        # ========== DEDUCT TOKENS (CRITICAL FINANCIAL OPERATION) ==========
        TokenService.finalize_locked_tokens(
            wallet=wallet,
            amount=payout.tokens_requested,
            transaction_type=TokenTransactionType.PAYOUT_DEBIT,
            reference_id=payout.reference_number,
            note=f"Payout {payout.reference_number} completed. {notes}"
        )
        

        
        # ========== UPDATE PAYOUT ==========
        payout.status = PayoutRequestStatus.PAID
        payout.admin_notes = notes
        payout.paid_at = timezone.now()
        payout.processed_by = admin_user
        payout.save(update_fields=[
            'status', 'admin_notes', 'paid_at', 'processed_by', 'updated_at'
        ])
        
        return payout
    
    # ====================================
    # QUERY HELPERS
    # ====================================
    
    @staticmethod
    def get_interviewer_payouts(interviewer, status=None):
        """Get payouts for an interviewer"""
        qs = PayoutRequest.objects.filter(
            interviewer=interviewer
        ).select_related('processed_by').order_by('-requested_at')
        
        if status:
            qs = qs.filter(status=status)
        
        return qs
    
    @staticmethod
    def get_pending_payouts(status=None):
        """Get all pending payouts (admin view)"""
        if status:
            qs = PayoutRequest.objects.filter(status=status)
        else:
            qs = PayoutRequest.objects.filter(
                status__in=[PayoutRequestStatus.REQUESTED, PayoutRequestStatus.APPROVED]
            )
        
        return qs.select_related('interviewer', 'processed_by').order_by('-requested_at')
    
    @staticmethod
    def get_payout_stats(interviewer):
        """Get payout statistics for an interviewer"""
        payouts = PayoutRequest.objects.filter(interviewer=interviewer)
        
        total_requested = payouts.aggregate(
            total=models.Sum('tokens_requested')
        )['total'] or 0
        
        total_paid = payouts.filter(
            status=PayoutRequestStatus.PAID
        ).aggregate(
            total=models.Sum('tokens_requested')
        )['total'] or 0
        
        total_amount_paid = payouts.filter(
            status=PayoutRequestStatus.PAID
        ).aggregate(
            total=models.Sum('amount_inr')
        )['total'] or Decimal('0.00')
        
        return {
            'total_tokens_requested': total_requested,
            'total_tokens_paid': total_paid,
            'total_amount_paid_inr': float(total_amount_paid),
            'pending_count': payouts.filter(
                status__in=[PayoutRequestStatus.REQUESTED, PayoutRequestStatus.APPROVED]
            ).count(),
            'completed_count': payouts.filter(status=PayoutRequestStatus.PAID).count(),
            'rejected_count': payouts.filter(status=PayoutRequestStatus.REJECTED).count(),
        }
    
            


