import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, TextInputKeyPressEventData, NativeSyntheticEvent } from "react-native";

interface OtpModalProps {
    open: boolean;
    onClose: () => void;
    onVerify: (otp: string) => void;
    onResend?: () => void;
    isLoading?: boolean;
    targetEmail?: string;
    apiError?: string;
}

export default function OtpModal({ open, onClose, onVerify, onResend, isLoading, targetEmail, apiError }: OtpModalProps) {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const inputs = useRef<(TextInput | null)[]>([]);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (open && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [open, countdown]);

    // Reset countdown when modal opens
    useEffect(() => {
        if (open) {
           setCountdown(60);
           setOtp(["", "", "", "", "", ""]);
        }
    }, [open]);

    const handleChange = (text: string, index: number) => {
        if (text.length > 1) {
            text = text[text.length - 1];
        }

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        if (countdown > 0) return;
        setOtp(["", "", "", "", "", ""]);
        setCountdown(60);
        inputs.current[0]?.focus();
        onResend && onResend();
    };

    return (
        <Modal
            visible={open}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 items-center justify-center bg-black/70">
                <View className="bg-black/85 w-11/12 max-w-sm p-6 rounded-xl border border-zinc-700 shadow-lg">
                    <Text className="text-2xl text-center font-bold text-white mb-2">
                        Xác minh OTP
                    </Text>
                    <Text className="text-zinc-300 text-center text-sm mb-6">
                        Mã OTP đã gửi đến email {targetEmail ? targetEmail : 'của bạn'}
                    </Text>

                    {apiError && (
                        <Text className="text-red-400 text-center text-sm mb-4 bg-red-950/30 p-2 rounded border border-red-700">
                            {apiError}
                        </Text>
                    )}

                    <View className="flex-row justify-between mb-8">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => { inputs.current[index] = el; }}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                className="w-10 h-10 md:w-12 md:h-14 text-center text-xl font-bold text-white bg-zinc-800/80 border border-zinc-700 rounded-md"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={() => onVerify(otp.join(""))}
                        disabled={isLoading}
                        className={`w-full py-4 rounded-lg items-center ${isLoading ? 'bg-red-800' : 'bg-red-600 active:bg-red-700'}`}
                    >
                        <Text className="text-white text-base font-bold">
                            {isLoading ? "Đang xác thực..." : "Xác minh"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleResend}
                        disabled={countdown > 0}
                        className="mt-6 self-center"
                    >
                        {countdown > 0 ? (
                            <Text className="text-zinc-500 text-sm">
                                Gửi lại mã sau {countdown}s
                            </Text>
                        ) : (
                            <Text className="text-red-500 text-sm font-semibold underline">
                                Gửi lại mã
                            </Text>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={onClose}
                        className="mt-4 self-center"
                    >
                        <Text className="text-zinc-500 text-sm">Đóng</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}
