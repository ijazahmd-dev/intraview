from rest_framework import serializers
from .models import TokenTransaction,TokenWallet, PayoutRequest, PayoutRequestStatus
import django_filters
from decimal import Decimal






class CandidateWalletSummarySerializer(serializers.Serializer):
    total_balance = serializers.IntegerField()
    locked_balance = serializers.IntegerField()
    available_balance = serializers.IntegerField()



class CandidateWalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenTransaction
        fields = [
            "id",
            "transaction_type",
            "amount",
            "balance_after",
            "locked_balance_after",
            "reference_id",
            "note",
            "created_at",
        ]




class CandidateWalletStatsSerializer(serializers.Serializer):
    tokens_purchased_total = serializers.IntegerField()
    tokens_spent_total = serializers.IntegerField()
    tokens_refunded_total = serializers.IntegerField()
    tokens_locked_now = serializers.IntegerField()

    transactions_count = serializers.IntegerField()







################################################    INTERVIEWER SERIALIZERS    ###################################################




class InterviewerWalletSummarySerializer(serializers.Serializer):
    total_balance = serializers.IntegerField()
    locked_balance = serializers.IntegerField()
    available_balance = serializers.IntegerField()


class InterviewerWalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenTransaction
        fields = [
            "id",
            "transaction_type",
            "amount",
            "balance_after",
            "locked_balance_after",
            "reference_id",
            "note",
            "created_at",
        ]


class InterviewerWalletStatsSerializer(serializers.Serializer):
    tokens_purchased_total = serializers.IntegerField()
    tokens_earned_total = serializers.IntegerField()
    tokens_spent_total = serializers.IntegerField()
    tokens_refunded_total = serializers.IntegerField()
    tokens_locked_now = serializers.IntegerField()
    transactions_count = serializers.IntegerField()


class InterviewerEarningsSerializer(serializers.Serializer):
    tokens_earned_total = serializers.IntegerField()
    earnings_last_7_days = serializers.IntegerField()
    earnings_last_30_days = serializers.IntegerField()
    completed_sessions_count = serializers.IntegerField()











class PayoutRequestSerializer(serializers.ModelSerializer):
    """
    Universal serializer for create, list, detail operations.
    Handles validation intelligently based on context.
    """
    
    interviewer_name = serializers.CharField(
        source='interviewer.interviewer_profile.display_name',
        read_only=True
    )
    interviewer_username = serializers.CharField(
        source='interviewer.username',
        read_only=True
    )
    masked_account = serializers.SerializerMethodField(read_only=True)
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    is_pending = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PayoutRequest
        fields = [
            'id',
            'reference_number',
            'interviewer',
            'interviewer_name',
            'interviewer_username',
            'tokens_requested',
            'amount_inr',
            'token_rate_snapshot',
            'bank_account_number',
            'ifsc_code',
            'account_holder_name',
            'mobile_number',
            'masked_account',
            'status',
            'status_display',
            'is_pending',
            'admin_notes',
            'rejection_reason',
            'requested_at',
            'updated_at',
            'paid_at',
        ]
        read_only_fields = [
            'id',
            'reference_number',
            'interviewer',
            'amount_inr',
            'token_rate_snapshot',
            'requested_at',
            'updated_at',
            'paid_at',
            'status',
            'admin_notes',
            'rejection_reason',
        ]
    
    def get_masked_account(self, obj):
        """Return masked account for security"""
        return obj.masked_account
    
    # ====================================
    # CREATION VALIDATIONS ONLY
    # ====================================
    
    def validate_tokens_requested(self, value):
        """Only validate on creation"""
        if self.instance:  # Update case - skip
            return value
        
        from django.conf import settings
        min_tokens = getattr(settings, 'PAYOUT_MIN_TOKENS', 50)
        
        if value < min_tokens:
            raise serializers.ValidationError(
                f"Minimum {min_tokens} tokens required. You requested {value}."
            )
        
        return value
    
    def validate_bank_account_number(self, value):
        """Validate only on creation"""
        if self.instance:
            return value
        
        if not value.isdigit():
            raise serializers.ValidationError(
                "Account number must contain only digits"
            )
        
        if not (9 <= len(value) <= 18):
            raise serializers.ValidationError(
                "Account number must be 9-18 digits"
            )
        
        return value
    
    def validate_ifsc_code(self, value):
        """Validate only on creation"""
        if self.instance:
            return value
        
        import re
        if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', value):
            raise serializers.ValidationError(
                "Invalid IFSC format. Example: SBIN0001234"
            )
        
        return value.upper()
    
    def validate_account_holder_name(self, value):
        """Validate only on creation"""
        if self.instance:
            return value
        
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Account holder name must be at least 3 characters"
            )
        
        return value.strip()
    
    def validate_mobile_number(self, value):
        """Validate only on creation"""
        if self.instance:
            return value
        
        import re
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Invalid 10-digit mobile number"
            )
        
        return value
    
    def validate(self, data):
        """Cross-field validation on creation"""
        if self.instance:
            return data
        
        # Check if interviewer already has active payout
        from .models import TokenWallet, PayoutRequestStatus
        
        interviewer = self.context['request'].user
        active_payout = PayoutRequest.objects.filter(
            interviewer=interviewer,
            status__in=[PayoutRequestStatus.REQUESTED, PayoutRequestStatus.APPROVED]
        ).exists()
        
        if active_payout:
            raise serializers.ValidationError(
                "You already have an active payout request. Please wait for it to be processed."
            )
        
        # Check wallet balance
        try:
            wallet = interviewer.token_wallet
        except TokenWallet.DoesNotExist:
            raise serializers.ValidationError(
                "Wallet not found. Please contact support."
            )
        
        available = wallet.balance - wallet.locked_balance
        tokens_needed = data.get('tokens_requested', 0)
        
        if available < tokens_needed:
            raise serializers.ValidationError(
                f"Insufficient balance. Available: {available}, Requested: {tokens_needed}"
            )
        
        return data










################################################ ADMIN SERIALIZERS ###################################################

class AdminTokenWalletSerializer(serializers.ModelSerializer):
    """
    Read-only admin serializer for wallets.
    """

    user_email = serializers.EmailField(source="user.email", read_only=True)
    total_balance = serializers.SerializerMethodField()

    class Meta:
        model = TokenWallet
        fields = [
            "id",
            "user_email",
            "balance",
            "locked_balance",
            "total_balance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_total_balance(self, obj):
        return obj.balance + obj.locked_balance


class AdminTokenTransactionSerializer(serializers.ModelSerializer):
    """
    Read-only admin serializer for token ledger.
    """

    user_email = serializers.EmailField(source="wallet.user.email", read_only=True)
    user_link = serializers.SerializerMethodField() 

    class Meta:
        model = TokenTransaction
        fields = [
            "id",
            "user_email",
            "user_link",
            "transaction_type",
            "amount",
            "reference_id",
            "note",
            "created_at",
        ]
        read_only_fields = fields

    def get_user_link(self, obj):
        return f"/api/admin/wallets/{obj.wallet.user.id}/transactions/"





class AdminWalletStatsSerializer(serializers.Serializer):
    total_wallets = serializers.IntegerField()
    total_balance_all = serializers.DecimalField(max_digits=12, decimal_places=2)
    top_wallet_balance = serializers.DecimalField(max_digits=12, decimal_places=2)





class TokenWalletFilter(django_filters.FilterSet):
    user_email = django_filters.CharFilter(
        field_name="user__email", lookup_expr="icontains"
    )
    min_balance = django_filters.NumberFilter(
        field_name="balance", lookup_expr="gte"
    )
    max_balance = django_filters.NumberFilter(
        field_name="balance", lookup_expr="lte"
    )

    class Meta:
        model = TokenWallet
        fields = ["user_email", "min_balance", "max_balance"]


class TokenTransactionFilter(django_filters.FilterSet):
    date_from = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="gte"
    )
    date_to = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="lte"
    )

    class Meta:
        model = TokenTransaction
        fields = ["transaction_type", "date_from", "date_to"]