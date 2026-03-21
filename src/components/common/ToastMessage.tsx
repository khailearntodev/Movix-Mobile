import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react-native";

export type ToastType = "success" | "error" | "warning";

interface ToastMessageProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide?: () => void;
  duration?: number;
}

export const ToastMessage: React.FC<ToastMessageProps> = ({ 
  visible, 
  message, 
  type = "success", 
  onHide,
  duration = 3000 
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onHide && visible) onHide();
    });
  };

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle size={24} color="#22c55e" />;
      case "error": return <XCircle size={24} color="#ef4444" />;
      case "warning": return <AlertTriangle size={24} color="#eab308" />;
    }
  };

  const getBgColor = () => {
     // Using dark background with border to match theme
     return "bg-zinc-900 border border-zinc-800";
  };

  return (
    <Animated.View 
        style={{ opacity }}
        className={`absolute top-16 left-4 right-4 z-50 p-4 rounded-xl flex-row items-center space-x-3 shadow-lg ${getBgColor()}`}
    >
      {getIcon()}
      <Text className="text-white font-medium flex-1 text-sm">{message}</Text>
    </Animated.View>
  );
};
