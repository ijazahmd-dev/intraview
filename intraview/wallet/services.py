from django.db import transaction
from .models import TokenWallet, TokenTransaction, TokenTransactionType



class InsufficientBalanceError(Exception):
    """Raised when wallet does not have enough available tokens."""
    pass


class InvalidTokenOperationError(Exception):
    """Raised when an invalid token operation is attempted."""
    pass







class TokenService:
    """
    Centralized service for ALL token operations.

    RULES:
    - No other part of the system may modify wallet balances.
    - Every mutation creates a TokenTransaction.
    - All operations are atomic.
    """

    # -----------------------------
    # Internal helpers
    # -----------------------------

    @staticmethod
    def _ensure_positive(amount: int, label: str):
        if amount <= 0:
            raise InvalidTokenOperationError(
                f"{label} amount must be positive."
            )

    @staticmethod
    def _validate_transaction_type(transaction_type: str):
        if transaction_type not in TokenTransactionType.values:
            raise InvalidTokenOperationError(
                f"Invalid transaction type: {transaction_type}"
            )

    @staticmethod
    @transaction.atomic
    def get_or_create_wallet(user) -> TokenWallet:
        # return TokenWallet.objects.select_for_update().get_or_create(user=user)[0]
        wallet, _ = TokenWallet.objects.get_or_create(user=user)
        return wallet  
    




    # -----------------------------
    # Public API
    # -----------------------------

    @staticmethod
    @transaction.atomic
    def credit_tokens(
        *,
        wallet: TokenWallet,
        amount: int,
        transaction_type: str,
        reference_id: str | None = None,
        note: str = "",
    ) -> TokenTransaction:
        """
        Credit tokens to wallet.
        Used for purchases, refunds, admin grants, session earnings.
        """

        wallet = TokenWallet.objects.select_for_update().get(pk=wallet.pk)

        TokenService._ensure_positive(amount, "Credit")
        TokenService._validate_transaction_type(transaction_type)

        wallet.balance += amount
        wallet.save(update_fields=["balance", "updated_at"])

        return TokenTransaction.objects.create(
            wallet=wallet,
            transaction_type=transaction_type,
            amount=amount,
            balance_after=wallet.balance,
            locked_balance_after=wallet.locked_balance,
            reference_id=reference_id,
            note=note,
        )
    


    @staticmethod
    @transaction.atomic
    def debit_tokens(
        *,
        wallet: TokenWallet,
        amount: int,
        transaction_type: str,
        reference_id: str | None = None,
        note: str = "",
    ) -> TokenTransaction:
        """
        Permanently remove tokens from available balance.
        Used for final consumption (AI usage, fees, etc).
        """

        wallet = TokenWallet.objects.select_for_update().get(pk=wallet.pk)

        TokenService._ensure_positive(amount, "Debit")
        TokenService._validate_transaction_type(transaction_type)

        if wallet.balance < amount:
            raise InsufficientBalanceError(
                f"Not enough tokens. Available: {wallet.balance}, "
                f"requested: {amount}."
            )

        wallet.balance -= amount
        wallet.save(update_fields=["balance", "updated_at"])

        return TokenTransaction.objects.create(
            wallet=wallet,
            transaction_type=transaction_type,
            amount=-amount,
            balance_after=wallet.balance,
            locked_balance_after=wallet.locked_balance,
            reference_id=reference_id,
            note=note,
        )
    


    @staticmethod
    @transaction.atomic
    def lock_tokens(
        *,
        wallet: TokenWallet,
        amount: int,
        transaction_type: str,
        reference_id: str | None = None,
        note: str = "",
    ) -> TokenTransaction:
        """
        Lock tokens so they cannot be spent elsewhere.
        Used when booking a session.
        """

        wallet = TokenWallet.objects.select_for_update().get(pk=wallet.pk)

        TokenService._ensure_positive(amount, "Lock")

        if wallet.balance < amount:
            raise InsufficientBalanceError(
                f"Not enough available tokens to lock. "
                f"Available: {wallet.balance}, requested: {amount}."
            )

        wallet.balance -= amount
        wallet.locked_balance += amount
        wallet.save(update_fields=["balance", "locked_balance", "updated_at"])

        return TokenTransaction.objects.create(
            wallet=wallet,
            transaction_type=transaction_type,
            amount=-amount,
            balance_after=wallet.balance,
            locked_balance_after=wallet.locked_balance,
            reference_id=reference_id,
            note=note,
        )
    



    @staticmethod
    @transaction.atomic
    def unlock_tokens(
        *,
        wallet: TokenWallet,
        amount: int,
        reference_id: str,
        note: str = "",
    ) -> TokenTransaction:
        """
        Unlock previously locked tokens.
        Used when booking is cancelled or expires.
        """

        wallet = TokenWallet.objects.select_for_update().get(pk=wallet.pk)

        TokenService._ensure_positive(amount, "Unlock")

        if wallet.locked_balance < amount:
            raise InvalidTokenOperationError(
                f"Not enough locked tokens to unlock. "
                f"Locked: {wallet.locked_balance}, requested: {amount}."
            )

        wallet.locked_balance -= amount
        wallet.balance += amount
        wallet.save(update_fields=["balance", "locked_balance", "updated_at"])

        return TokenTransaction.objects.create(
            wallet=wallet,
            transaction_type=TokenTransactionType.BOOKING_RELEASE,
            amount=amount,
            balance_after=wallet.balance,
            locked_balance_after=wallet.locked_balance,
            reference_id=reference_id,
            note=note,
        )
    


    @staticmethod
    @transaction.atomic
    def transfer_locked_tokens(
        *,
        from_wallet: TokenWallet,
        to_wallet: TokenWallet,
        amount: int,
        reference_id: str,
        note: str = "",
    ):
        """
        Transfer locked tokens from one wallet to another.
        Used when a session is successfully completed.
        """

        # 1️⃣ Validate amount
        TokenService._ensure_positive(amount, "Transfer")

        # 2️⃣ Lock BOTH wallets in a deterministic order (by PK)
        if from_wallet.pk < to_wallet.pk:
            locked_from = TokenWallet.objects.select_for_update().get(pk=from_wallet.pk)
            locked_to = TokenWallet.objects.select_for_update().get(pk=to_wallet.pk)
        else:
            locked_to = TokenWallet.objects.select_for_update().get(pk=to_wallet.pk)
            locked_from = TokenWallet.objects.select_for_update().get(pk=from_wallet.pk)

        # 3️⃣ Validate locked balance AFTER locking
        if locked_from.locked_balance < amount:
            raise InvalidTokenOperationError(
                f"Not enough locked tokens to transfer. "
                f"Locked: {locked_from.locked_balance}, requested: {amount}."
            )

        # 4️⃣ Deduct from sender locked balance
        locked_from.locked_balance -= amount
        locked_from.save(update_fields=["locked_balance", "updated_at"])

        TokenTransaction.objects.create(
            wallet=locked_from,
            transaction_type=TokenTransactionType.SESSION_SPEND,
            amount=-amount,
            balance_after=locked_from.balance,
            locked_balance_after=locked_from.locked_balance,
            reference_id=reference_id,
            note="Session completed - tokens spent",
        )

        # 5️⃣ Credit receiver balance
        locked_to.balance += amount
        locked_to.save(update_fields=["balance", "updated_at"])

        TokenTransaction.objects.create(
            wallet=locked_to,
            transaction_type=TokenTransactionType.SESSION_EARN,
            amount=amount,
            balance_after=locked_to.balance,
            locked_balance_after=locked_to.locked_balance,
            reference_id=reference_id,
            note=note or "Session completed - tokens earned",
        )




    

    











