import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, ExternalLink, X } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { RootStackParamList } from '@/types/navigation';

type PaymentWebViewRouteProp = RouteProp<RootStackParamList, 'PaymentWebView'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PAYMENT_RETURN_ORIGIN = (process.env.EXPO_PUBLIC_FE_URL || 'https://movix-fe.vercel.app')
  .replace(/\/$/, '')
  .toLowerCase();

const isPaymentFinishedUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const origin = parsedUrl.origin.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();

    return (
      origin === PAYMENT_RETURN_ORIGIN &&
      (pathname === '/payment/success' || pathname === '/payment/cancel')
    );
  } catch {
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.startsWith(`${PAYMENT_RETURN_ORIGIN}/payment/success`) ||
      lowerUrl.startsWith(`${PAYMENT_RETURN_ORIGIN}/payment/cancel`)
    );
  }
};

const isSuccessUrl = (url: string) => {
  try {
    return new URL(url).pathname.toLowerCase() === '/payment/success';
  } catch {
    return url.toLowerCase().startsWith(`${PAYMENT_RETURN_ORIGIN}/payment/success`);
  }
};

export default function PaymentWebViewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PaymentWebViewRouteProp>();
  const { paymentUrl, paymentMethod = 'PAYOS', orderCode } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [hasHandledResult, setHasHandledResult] = useState(false);

  const closePayment = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Subscription');
  };

  const handleFinishedUrl = (url: string) => {
    if (hasHandledResult) return;

    setHasHandledResult(true);
    const isSuccess = isSuccessUrl(url);
    Alert.alert(
      isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất',
      isSuccess
        ? 'Giao dịch đã được ghi nhận. Thông tin gói sẽ được cập nhật trong giây lát.'
        : 'Bạn có thể quay lại và thử thanh toán lại sau.',
      [{ text: 'OK', onPress: closePayment }],
    );
  };

  return (
    <View className="flex-1 bg-zinc-950 pt-12">
      <View className="px-4 pb-3 flex-row items-center justify-between border-b border-zinc-800">
        <TouchableOpacity onPress={closePayment} className="flex-row items-center gap-3 py-2">
          <ChevronLeft size={26} color="white" />
          <View>
            <Text className="text-white text-lg font-bold">Thanh toán</Text>
            <Text className="text-zinc-400 text-xs">
              {paymentMethod}{orderCode ? ` - ${orderCode}` : ''}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => Linking.openURL(paymentUrl)} className="p-2">
            <ExternalLink size={20} color="#a1a1aa" />
          </TouchableOpacity>
          <TouchableOpacity onPress={closePayment} className="p-2">
            <X size={22} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && (
        <View className="absolute inset-x-0 top-28 z-10 items-center">
          <View className="rounded-full bg-zinc-900 px-4 py-2 flex-row items-center gap-2 border border-zinc-800">
            <ActivityIndicator size="small" color="#eab308" />
            <Text className="text-zinc-300 text-sm">Đang tải công thanh toán...</Text>
          </View>
        </View>
      )}

      <WebView
        source={{ uri: paymentUrl }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={(navState) => {
          if (isPaymentFinishedUrl(navState.url)) {
            handleFinishedUrl(navState.url);
          }
        }}
        onShouldStartLoadWithRequest={(request) => {
          if (isPaymentFinishedUrl(request.url)) {
            handleFinishedUrl(request.url);
            return false;
          }

          if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
            Linking.openURL(request.url).catch(() => {
              Alert.alert('Lỗi', 'Không thể mở ứng dụng thanh toán.');
            });
            return false;
          }

          return true;
        }}
        onError={() => {
          setIsLoading(false);
          Alert.alert('Lỗi', 'Không thể tải công thanh toán.');
        }}
      />
    </View>
  );
}
