from django.contrib import admin
from .models import Order, Payment


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'service', 'razorpay_order_id', 'amount_paise', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['user__username', 'razorpay_order_id']
    readonly_fields = ['razorpay_order_id', 'amount_paise', 'currency', 'created_at', 'updated_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'razorpay_payment_id', 'created_at']
    readonly_fields = ['razorpay_payment_id', 'razorpay_signature', 'created_at']
