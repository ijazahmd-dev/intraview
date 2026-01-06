from django.contrib import admin
from .models import TokenWallet, TokenTransaction
from django.http import HttpResponseRedirect

# Register your models here.



@admin.register(TokenWallet)
class TokenWalletAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "balance",
        "locked_balance",
        "created_at",
        "updated_at",
    )
    search_fields = ("user__email", "user__username")
    readonly_fields = ("created_at", "updated_at")
    actions = ["view_recent_transactions"]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def view_recent_transactions(self, request, queryset):
        """
        Admin action: jump to transaction list filtered by selected wallets.
        """
        wallet_ids = ",".join(map(str, queryset.values_list("id", flat=True)))
        return HttpResponseRedirect(
            f"/admin/wallet/tokentransaction/?wallet__id__in={wallet_ids}"
        )

    view_recent_transactions.short_description = "View recent transactions"
    





@admin.register(TokenTransaction)
class TokenTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "wallet",
        "transaction_type",
        "amount",
        "balance_after",
        "locked_balance_after",
        "reference_id",
        "created_at",
    )

    list_filter = ("transaction_type", "created_at")
    search_fields = ("wallet__user__email", "reference_id")
    readonly_fields = (
        "wallet",
        "transaction_type",
        "amount",
        "balance_after",
        "locked_balance_after",
        "reference_id",
        "note",
        "created_at",
    )

    def has_add_permission(self, request):
        return False  # Transactions are system-generated only

    def has_delete_permission(self, request, obj=None):
        return False  # Ledger must be immutable
