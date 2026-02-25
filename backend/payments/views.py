"""
Payment Views
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

from authentication.authentication import SupabaseJWTAuthentication
from .models import PaymentTransaction
from .serializers import PaymentInitiationSerializer, PaymentTransactionSerializer
from .services import PaymentService


class InitiatePaymentView(APIView):
    """
    POST: Initiate a payment transaction
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Initiate payment"""
        serializer = PaymentInitiationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payment = PaymentService.initiate_payment(
                user=request.user,
                amount=serializer.validated_data["amount"],
                gateway=serializer.validated_data["gateway"],
                transaction_type=serializer.validated_data.get(
                    "transaction_type", "WALLET_FUNDING"
                ),
                description=serializer.validated_data.get("description"),
                metadata=serializer.validated_data.get("metadata", {}),
            )

            return Response(
                {
                    "message": "Payment initiated successfully",
                    "payment": PaymentTransactionSerializer(payment).data,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to initiate payment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class VerifyPaymentView(APIView):
    """
    GET: Verify payment status
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, reference):
        """Verify payment"""
        try:
            # Verify transaction belongs to user
            payment = PaymentTransaction.objects.filter(
                reference=reference, user=request.user
            ).first()

            if not payment:
                return Response(
                    {"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # Verify with gateway
            updated_payment = PaymentService.verify_payment(reference)

            return Response(
                {
                    "message": "Payment verified",
                    "payment": PaymentTransactionSerializer(updated_payment).data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"Verification failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@method_decorator(csrf_exempt, name="dispatch")
class PaymentWebhookView(APIView):
    """
    POST: Handle payment gateway webhooks
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        """Process webhook"""
        try:
            # Determine gateway
            if "x-paystack-signature" in request.headers:
                gateway = "paystack"
            elif "verif-hash" in request.headers:
                gateway = "flutterwave"
            else:
                return Response(
                    {"error": "Unknown webhook source"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Process webhook
            payload = json.loads(request.body)

            payment = PaymentService.process_webhook(
                gateway=gateway,
                payload=payload,
                headers=dict(request.headers),
                raw_body=request.body,
            )

            if payment:
                return Response({"status": "success"}, status=status.HTTP_200_OK)
            else:
                return Response(
                    {
                        "status": "processed",
                        "message": "Webhook logged but not processed",
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentHistoryView(APIView):
    """
    GET: Get user's payment history
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get payment history"""
        try:
            limit = request.query_params.get("limit")
            if limit:
                limit = int(limit)

            payments = PaymentService.get_user_payment_history(request.user, limit)
            serializer = PaymentTransactionSerializer(payments, many=True)

            return Response(
                {"count": payments.count(), "payments": serializer.data},
                status=status.HTTP_200_OK,
            )

        except ValueError:
            return Response(
                {"error": "Invalid limit parameter"}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentDetailView(APIView):
    """
    GET: Get specific payment details
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, reference):
        """Get payment details"""
        try:
            payment = PaymentTransaction.objects.filter(
                reference=reference, user=request.user
            ).first()

            if not payment:
                return Response(
                    {"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND
                )

            serializer = PaymentTransactionSerializer(payment)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
