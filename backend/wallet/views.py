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

from authentication.authentication import SupabaseJWTAuthentication
from .models import Wallet, WalletTransaction
from .serializers import (
    WalletSerializer,
    WalletTransactionSerializer,
    WalletFundingRequestSerializer
)
from .services import WalletService


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
            # Get query parameters
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
            
            # Verify transaction belongs to user
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
    POST: Initiate wallet funding (will integrate with payment gateway)
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

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
            # Get or create wallet
            wallet = WalletService.get_or_create_wallet(request.user)
            
            # Generate transaction reference for this funding attempt
            reference = WalletService.generate_transaction_reference('FUND')
            
            # Create pending transaction
            pending_transaction = WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='CREDIT',
                amount=amount,
                balance_before=wallet.balance,
                balance_after=wallet.balance,  # Will be updated on success
                status='PENDING',
                source='FUNDING',
                reference=reference,
                description=f"Wallet funding of ₦{amount}",
                metadata={
                    'payment_method': payment_method,
                    'initiated_by': request.user.email
                }
            )
            
            # TODO: Integrate with payment gateway (Paystack/Flutterwave)
            # For now, return payment initialization data
            
            return Response({
                "message": "Funding initiated successfully",
                "transaction_reference": reference,
                "amount": str(amount),
                "payment_method": payment_method,
                "status": "PENDING",
                "next_step": "Complete payment via payment gateway"
            }, status=status.HTTP_201_CREATED)
            
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
    This endpoint should be used by other internal services, not directly by frontend
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
            
            # Perform debit operation
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