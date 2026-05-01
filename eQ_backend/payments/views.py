import razorpay
from decimal import Decimal

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from explore.models import Service
from .models import Order, Payment
from .serializers import (
    CreateOrderSerializer,
    OrderResponseSerializer,
    VerifyPaymentSerializer,
    OrderListSerializer,
)


def _razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        service_id = serializer.validated_data['service_id']
        try:
            service = Service.objects.get(pk=service_id, is_active=True)
        except Service.DoesNotExist:
            return Response(
                {'detail': 'Service not found or inactive.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        amount_paise = int(Decimal(str(service.price)) * 100)
        receipt = f"order_{request.user.id}_{service_id}"

        client = _razorpay_client()
        razorpay_order = client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'receipt': receipt,
            'payment_capture': 1,
        })

        order = Order.objects.create(
            user=request.user,
            service=service,
            razorpay_order_id=razorpay_order['id'],
            amount_paise=amount_paise,
            currency='INR',
            status=Order.STATUS_PENDING,
        )

        response_serializer = OrderResponseSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        razorpay_order_id = serializer.validated_data['razorpay_order_id']
        razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
        razorpay_signature = serializer.validated_data['razorpay_signature']

        try:
            order = Order.objects.get(
                razorpay_order_id=razorpay_order_id,
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status == Order.STATUS_PAID:
            return Response({'detail': 'Order already paid.'}, status=status.HTTP_200_OK)

        client = _razorpay_client()
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            order.status = Order.STATUS_FAILED
            order.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': 'Payment signature verification failed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = Order.STATUS_PAID
        order.save(update_fields=['status', 'updated_at'])
        Payment.objects.create(
            order=order,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
        )
        return Response({'detail': 'Payment verified successfully.'}, status=status.HTTP_200_OK)


class UserOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = (
            Order.objects.filter(user=request.user)
            .select_related('service__service_group')
            .order_by('-created_at')
        )
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)


class MarkOrderFailedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        if not razorpay_order_id:
            return Response({'detail': 'razorpay_order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(
                razorpay_order_id=razorpay_order_id,
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status == Order.STATUS_PENDING:
            order.status = Order.STATUS_FAILED
            order.save(update_fields=['status', 'updated_at'])

        return Response({'detail': 'Order marked as failed.'}, status=status.HTTP_200_OK)
