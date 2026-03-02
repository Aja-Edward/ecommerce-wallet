"""
Wallet Views
API endpoints for wallet operations
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.db import DatabaseError
from django.conf import settings
import logging

from authentication.authentication import SupabaseJWTAuthentication
from .models import Wallet, WalletTransaction
from .serializers import (
    WalletSerializer,
    WalletTransactionSerializer,
    WalletFundingRequestSerializer
)
from .services import WalletService
from payments.gateways.paystack import PaystackGateway
from payments.gateways.flutterwave import FlutterwaveGateway

from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

logger = logging.getLogger(__name__)

class WalletDetailView(APIView):
    """
    GET: Retrieve user's wallet details and balance
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get authenticated user's wallet"""
        try:
            wallet = WalletService.get_or_create_wallet(request.user)
            serializer = WalletSerializer(wallet)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to retrieve wallet: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WalletTransactionListView(APIView):
    """
    GET: Retrieve user's transaction history
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get authenticated user's transaction history"""
        try:
            limit = request.query_params.get('limit', None)
            if limit:
                limit = int(limit)

            transactions = WalletService.get_transaction_history(
                request.user,
                limit=limit
            )
            serializer = WalletTransactionSerializer(transactions, many=True)

            return Response({
                "count": transactions.count(),
                "transactions": serializer.data
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response(
                {"error": "Invalid limit parameter"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to retrieve transactions: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WalletUserLookupView(APIView):
    """
    GET: Lookup a user by username or email
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("username")

        if not query:
            return Response(
                {"error": "username or email query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = (
            User.objects.filter(Q(username__iexact=query) | Q(email__iexact=query))
            .exclude(id=request.user.id)  # optional: prevent self lookup
            .values("id", "username", "email")
            .first()
        )

        if not user:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
            },
            status=status.HTTP_200_OK,
        )


class WalletTransactionDetailView(APIView):
    """
    GET: Retrieve a specific transaction by reference
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, reference):
        """Get transaction by reference"""
        try:
            transaction = WalletService.get_transaction_by_reference(reference)

            if not transaction:
                return Response(
                    {"error": "Transaction not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if transaction.wallet.user != request.user:
                return Response(
                    {"error": "You don't have permission to view this transaction"},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = WalletTransactionSerializer(transaction)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to retrieve transaction: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InitiateFundingView(APIView):
    """
    POST: Initiate wallet funding via Paystack or Flutterwave.

    Request body:
        amount        (Decimal)  – amount in Naira, min 100
        payment_method (str)    – 'paystack' or 'flutterwave'

    Response:
        message        (str)
        transaction_reference (str)
        payment_url    (str)   – redirect the user here to complete payment
        amount         (str)
        payment_method (str)
        status         (str)
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    # Map incoming payment_method values to gateway classes
    GATEWAY_MAP = {
        "paystack": PaystackGateway,
        "flutterwave": FlutterwaveGateway,
    }

    def post(self, request):
        """Initiate wallet funding"""
        serializer = WalletFundingRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        amount = serializer.validated_data['amount']
        payment_method = serializer.validated_data['payment_method']

        try:
            # ── 1. Get or create wallet ────────────────────────────────────
            wallet = WalletService.get_or_create_wallet(request.user)

            # ── 2. Generate unique reference ───────────────────────────────
            reference = WalletService.generate_transaction_reference('FUND')

            # ── 3. Create PENDING wallet transaction ───────────────────────
            pending_transaction = WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type="CREDIT",
                amount=amount,
                balance_before=wallet.balance,
                balance_after=wallet.balance,  # updated on webhook confirmation
                status="PENDING",
                source="FUNDING",
                reference=reference,
                description=f"Wallet funding of ₦{amount}",
                metadata={
                    "payment_method": payment_method,
                    "initiated_by": request.user.email,
                },
            )

            # ── 4. Initialise payment gateway ──────────────────────────────
            GatewayClass = self.GATEWAY_MAP.get(payment_method)
            if not GatewayClass:
                pending_transaction.status = "FAILED"
                pending_transaction.save()
                return Response(
                    {"error": f"Unsupported payment method: {payment_method}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            gateway = GatewayClass()

            # Callback URL — Paystack/Flutterwave redirects here after payment
            callback_url = (
                f"{settings.FRONTEND_URL}/dashboard"
                f"?payment_reference={reference}&status=completed"
            )

            gateway_response = gateway.initialize_transaction(
                email=request.user.email,
                amount=amount,
                reference=reference,
                callback_url=callback_url,
                metadata={
                    "wallet_transaction_id": pending_transaction.id,
                    "user_id": request.user.id,
                    "funding_type": "WALLET_FUNDING",
                },
            )

            # ── 5. Store gateway reference on the transaction ──────────────
            pending_transaction.metadata.update(
                {
                    "gateway_reference": gateway_response.get("reference"),
                    "access_code": gateway_response.get("access_code"),  # Paystack only
                }
            )
            pending_transaction.save()

            # ── 6. Return payment URL to frontend ──────────────────────────
            return Response(
                {
                    "message": "Funding initiated successfully",
                    "transaction_reference": reference,
                    "payment_url": gateway_response["payment_url"],
                    "amount": str(amount),
                    "payment_method": payment_method,
                    "status": "PENDING",
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to initiate funding: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WalletBalanceView(APIView):
    """
    GET: Get current wallet balance (quick endpoint)
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user's current wallet balance"""
        try:
            balance = WalletService.get_wallet_balance(request.user)
            return Response({
                "balance": str(balance),
                "currency": "NGN"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to retrieve balance: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DebitWalletView(APIView):
    """
    POST: Debit wallet (Internal use - for orders/checkout)
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Debit user's wallet"""
        try:
            amount = request.data.get('amount')
            description = request.data.get('description', '')
            metadata = request.data.get('metadata', {})

            if not amount:
                return Response(
                    {"error": "Amount is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            transaction = WalletService.debit_wallet(
                user=request.user,
                amount=amount,
                source='ORDER_PAYMENT',
                description=description,
                metadata=metadata
            )

            serializer = WalletTransactionSerializer(transaction)
            return Response({
                "message": "Wallet debited successfully",
                "transaction": serializer.data
            }, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except DatabaseError as e:
            return Response(
                {"error": f"Database error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to debit wallet: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyWalletFundingView(APIView):
    """
    GET: Verify and complete a wallet funding transaction
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, reference):
        """Verify wallet funding transaction with payment gateway"""
        logger.info(f"=" * 80)
        logger.info(f"🔍 VERIFICATION REQUEST RECEIVED")
        logger.info(f"Reference: {reference}")
        logger.info(f"User: {request.user.email}")
        logger.info(f"=" * 80)

        try:
            # Get the transaction
            transaction = WalletTransaction.objects.filter(
                reference=reference, wallet__user=request.user
            ).first()

            if not transaction:
                logger.error(f"❌ Transaction NOT found: {reference}")
                return Response(
                    {"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND
                )

            logger.info(f"✅ Transaction found!")
            logger.info(f"   ID: {transaction.id}")
            logger.info(f"   Status: {transaction.status}")
            logger.info(f"   Amount: {transaction.amount}")
            logger.info(f"   Metadata: {transaction.metadata}")

            # If already completed, just return it
            if transaction.status == "COMPLETED":
                logger.info(f"ℹ️  Transaction already COMPLETED, returning...")
                serializer = WalletTransactionSerializer(transaction)
                return Response(
                    {
                        "message": "Transaction already completed",
                        "transaction": serializer.data,
                        "status": "COMPLETED",
                    },
                    status=status.HTTP_200_OK,
                )

            # Get payment method from metadata
            payment_method = transaction.metadata.get("payment_method", "paystack")
            logger.info(f"💳 Payment method: {payment_method}")

            # Initialize gateway
            if payment_method == "paystack":
                logger.info("📡 Using Paystack gateway...")
                from payments.gateways.paystack import PaystackGateway

                gateway = PaystackGateway()
            elif payment_method == "flutterwave":
                logger.info("📡 Using Flutterwave gateway...")
                from payments.gateways.flutterwave import FlutterwaveGateway

                gateway = FlutterwaveGateway()
            else:
                logger.error(f"❌ Invalid payment method: {payment_method}")
                return Response(
                    {"error": "Invalid payment method"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Verify with gateway
            logger.info(f"🔄 Calling gateway.verify_transaction({reference})...")
            verification_result = gateway.verify_transaction(reference)
            logger.info(f"📥 Gateway response:")
            logger.info(f"   Success: {verification_result.get('success')}")
            logger.info(f"   Full result: {verification_result}")

            # Check if payment was successful
            if verification_result.get("success"):
                logger.info("✅ Payment SUCCESSFUL! Updating database...")

                # Update transaction status
                old_status = transaction.status
                transaction.status = "COMPLETED"
                logger.info(f"   Transaction status: {old_status} → COMPLETED")

                # Update wallet balance
                wallet = transaction.wallet
                old_balance = wallet.balance
                wallet.balance += transaction.amount
                transaction.balance_after = wallet.balance
                logger.info(f"   Wallet balance: ₦{old_balance} → ₦{wallet.balance}")

                # Update metadata with gateway info
                transaction.metadata.update(
                    {
                        "gateway_reference": verification_result.get(
                            "gateway_reference"
                        ),
                        "paid_at": verification_result.get("paid_at"),
                        "verified_amount": str(verification_result.get("amount")),
                    }
                )

                # Save both
                wallet.save()
                transaction.save()
                logger.info("💾 Saved wallet and transaction to database")

                serializer = WalletTransactionSerializer(transaction)
                logger.info("🎉 VERIFICATION COMPLETE!")
                logger.info(f"=" * 80)

                return Response(
                    {
                        "message": "Payment verified and wallet funded successfully",
                        "transaction": serializer.data,
                        "status": "COMPLETED",
                        "new_balance": str(wallet.balance),
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                # Payment failed
                logger.error(f"❌ Payment verification FAILED")
                logger.error(f"   Reason: {verification_result.get('status')}")

                transaction.status = "FAILED"
                transaction.metadata.update(
                    {
                        "failure_reason": verification_result.get("status"),
                        "verification_response": str(
                            verification_result.get("raw_response")
                        ),
                    }
                )
                transaction.save()
                logger.info("💾 Saved FAILED status to database")

                return Response(
                    {
                        "error": "Payment verification failed",
                        "status": "FAILED",
                        "details": verification_result.get("status"),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            logger.exception(f"💥 EXCEPTION during verification:")
            logger.error(f"   Error: {str(e)}")
            logger.error(f"=" * 80)
            return Response(
                {"error": f"Verification failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
