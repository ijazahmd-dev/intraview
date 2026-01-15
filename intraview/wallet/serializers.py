from rest_framework import serializers
from .models import TokenTransaction,TokenWallet
import django_filters






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