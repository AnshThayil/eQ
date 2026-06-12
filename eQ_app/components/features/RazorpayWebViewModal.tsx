import React, { useRef } from 'react';
import {
  Alert,
  Linking,
  Modal,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { PaymentOrderResponse } from '@/services/api';
import { Theme } from '@/constants';

export interface RazorpaySuccessData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface Props {
  visible: boolean;
  orderData: PaymentOrderResponse | null;
  itemName: string;
  onSuccess: (data: RazorpaySuccessData) => void;
  onFailure: (description: string) => void;
  onDismiss: () => void;
}

function buildCheckoutHtml(orderData: PaymentOrderResponse, itemName: string): string {
  const safeItemName = itemName.replace(/'/g, "\\'").replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safePrefillName = orderData.prefill_name.replace(/'/g, "\\'");
  const safePrefillEmail = orderData.prefill_email.replace(/'/g, "\\'");
  const safePrefillContact = orderData.prefill_contact.replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #f4f4f4; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  </style>
</head>
<body>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  var options = {
    key: '${orderData.razorpay_key_id}',
    order_id: '${orderData.razorpay_order_id}',
    amount: ${orderData.amount_paise},
    currency: '${orderData.currency}',
    name: 'eQ',
    description: '${safeItemName}',
    prefill: {
      name: '${safePrefillName}',
      email: '${safePrefillEmail}',
      contact: '${safePrefillContact}'
    },
    method: {
      upi: true
    },
    handler: function(response) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'success',
        data: response
      }));
    },
    modal: {
      ondismiss: function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismiss' }));
      }
    }
  };

  var rzp = new Razorpay(options);

  rzp.on('payment.failed', function(response) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'failure',
      data: response.error
    }));
  });

  rzp.open();
</script>
</body>
</html>`;
}

export default function RazorpayWebViewModal({
  visible,
  orderData,
  itemName,
  onSuccess,
  onFailure,
  onDismiss,
}: Props) {
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();

  if (!orderData) return null;

  const html = buildCheckoutHtml(orderData, itemName);

  const handleShouldStartLoad = (request: WebViewNavigation): boolean => {
    const { url } = request;
    // Intercept UPI Intent URLs on Android and dispatch to installed UPI apps
    const upiSchemes = ['upi://', 'intent://', 'tez://', 'phonepe://', 'paytmmp://'];
    if (upiSchemes.some((scheme) => url.startsWith(scheme))) {
      Linking.openURL(url).catch(() => {
        Alert.alert('No UPI app found', 'Please install a UPI-enabled app (GPay, PhonePe, etc.) to pay.');
      });
      return false;
    }
    // Allow Razorpay checkout and its CDN resources
    return true;
  };

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        type: 'success' | 'failure' | 'dismiss';
        data?: RazorpaySuccessData | { description: string };
      };

      if (message.type === 'success') {
        onSuccess(message.data as RazorpaySuccessData);
      } else if (message.type === 'failure') {
        onFailure('Payment could not be completed. Please try again.');
      } else if (message.type === 'dismiss') {
        onDismiss();
      }
    } catch {
      // Ignore non-JSON messages from third-party scripts
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <WebView
          ref={webViewRef}
          source={{
            html,
            // baseUrl is critical: allows checkout.js to make XHR calls back to
            // Razorpay servers (same-origin context) without CORS errors
            baseUrl: 'https://checkout.razorpay.com',
          }}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
            </View>
          )}
          style={styles.webView}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  webView: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
});
