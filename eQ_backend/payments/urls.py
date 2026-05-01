from django.urls import path
from .views import CreateOrderView, VerifyPaymentView, UserOrdersView, MarkOrderFailedView

urlpatterns = [
    path('payments/create-order/', CreateOrderView.as_view(), name='payment-create-order'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('payments/mark-failed/', MarkOrderFailedView.as_view(), name='payment-mark-failed'),
    path('payments/orders/', UserOrdersView.as_view(), name='payment-orders'),
]
