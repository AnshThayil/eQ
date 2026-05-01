import { useState } from 'react';
import { Alert } from 'react-native';
import { createPaymentOrder, verifyPayment, markPaymentFailed, PaymentOrderResponse } from '@/services/api';
import { RazorpaySuccessData } from '@/components/features/RazorpayWebViewModal';

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [orderData, setOrderData] = useState<PaymentOrderResponse | null>(null);
  const [currentItemName, setCurrentItemName] = useState('');

  const initiatePayment = async (serviceId: number, itemName: string) => {
    setIsProcessing(true);
    try {
      const order = await createPaymentOrder(serviceId);
      setOrderData(order);
      setCurrentItemName(itemName);
      setModalVisible(true);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not initiate payment. Please try again.';
      Alert.alert('Payment Error', message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccess = async (data: RazorpaySuccessData) => {
    setIsProcessing(true);
    try {
      await verifyPayment({
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });
      setModalVisible(false);
      setOrderData(null);
      Alert.alert('Payment Successful', 'Your purchase is confirmed!');
    } catch {
      setModalVisible(false);
      setOrderData(null);
      Alert.alert('Verification Failed', 'Payment received but verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFailure = (description: string) => {
    // Mark order as failed on the backend (best-effort, don't await)
    if (orderData) {
      markPaymentFailed(orderData.razorpay_order_id).catch(() => {});
    }
    setModalVisible(false);
    setOrderData(null);
    Alert.alert('Payment Failed', description);
  };

  const handleDismiss = () => {
    if (orderData) {
      markPaymentFailed(orderData.razorpay_order_id).catch(() => {});
    }
    setModalVisible(false);
    setOrderData(null);
  };

  return {
    initiatePayment,
    isProcessing,
    modalVisible,
    orderData,
    currentItemName,
    handleSuccess,
    handleFailure,
    handleDismiss,
  };
}
