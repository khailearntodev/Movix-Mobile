import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Receipt, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { subscriptionService } from '@/services/subscription.service';
import { Transaction } from '@/types/subscription';

const TransactionsScreen = () => {
    const navigation = useNavigation();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async (pageNum = 1) => {
        try {
            if (pageNum === 1) setIsLoading(true);
            const data = await subscriptionService.getUserTransactionHistory({ page: pageNum, limit: 10 });
            
            if (pageNum === 1) {
                setTransactions(data.items);
            } else {
                setTransactions(prev => [...prev, ...data.items]);
            }
            
            setHasMore(data.meta.currentPage < data.meta.totalPages);
            setPage(pageNum);
        } catch (error: any) {
            console.error('Fetch transactions error:', error);
            if (pageNum === 1) {
                Alert.alert('Lỗi', 'Không thể tải lịch sử giao dịch.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = () => {
        if (!isLoading && hasMore) {
            fetchTransactions(page + 1);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'PAID':
                return <CheckCircle size={20} color="#22c55e" />; // green-500
            case 'PENDING':
                return <Clock size={20} color="#eab308" />; // yellow-500
            case 'FAILED':
            case 'CANCELLED':
            case 'EXPIRED':
                return <XCircle size={20} color="#ef4444" />; // red-500
            default:
                return <AlertCircle size={20} color="#a1a1aa" />; // zinc-400
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'PAID':
                return <Text className="text-green-500 font-medium">Thành công</Text>;
            case 'PENDING':
                return <Text className="text-yellow-500 font-medium">Đang xử lý</Text>;
            case 'FAILED':
            case 'CANCELLED':
            case 'EXPIRED':
                return <Text className="text-red-500 font-medium">Thất bại/Đã hủy</Text>;
            default:
                return <Text className="text-zinc-400 font-medium">{status}</Text>;
        }
    };

    const formatCurrency = (amount: number, currency: string = 'VND') => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit', minute: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        }).format(date);
    };

    const renderItem = ({ item }: { item: Transaction }) => (
        <View className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-800">
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                    <Receipt size={20} color="#eab308" />
                    <Text className="text-white font-bold text-lg">
                        {item.plan?.name || 'Gói dịch vụ'}
                    </Text>
                </View>
                <Text className="text-yellow-500 font-bold">
                    {formatCurrency(item.amount, item.currency)}
                </Text>
            </View>
            
            <View className="space-y-2">
                <View className="flex-row justify-between">
                    <Text className="text-zinc-400">Trạng thái:</Text>
                    <View className="flex-row items-center gap-1">
                        {getStatusIcon(item.status)}
                        {getStatusText(item.status)}
                    </View>
                </View>
                
                <View className="flex-row justify-between">
                    <Text className="text-zinc-400">Thời gian:</Text>
                    <Text className="text-zinc-300">{formatDate(item.created_at)}</Text>
                </View>
                
                {item.transaction_ref && (
                    <View className="flex-row justify-between">
                        <Text className="text-zinc-400">Mã GD:</Text>
                        <Text className="text-zinc-300">{item.transaction_ref}</Text>
                    </View>
                )}
                
                <View className="flex-row justify-between">
                    <Text className="text-zinc-400">Phương thức:</Text>
                    <Text className="text-zinc-300">{item.payment_method}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-zinc-950 pt-12">
            <View className="px-4 pb-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                    <ChevronLeft size={28} color="white" />
                    <Text className="text-white text-xl font-bold">Lịch sử giao dịch</Text>
                </TouchableOpacity>
            </View>

            {isLoading && page === 1 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#eab308" />
                </View>
            ) : transactions.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Receipt size={64} color="#52525b" className="mb-4" />
                    <Text className="text-zinc-400 text-center text-lg">
                        Bạn chưa có giao dịch nào.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isLoading && page > 1 ? (
                            <ActivityIndicator size="small" color="#eab308" className="my-4" />
                        ) : null
                    }
                />
            )}
        </View>
    );
};

export default TransactionsScreen;
