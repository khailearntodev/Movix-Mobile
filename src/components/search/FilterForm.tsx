import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { X, RotateCcw, Check, Star, Calendar } from 'lucide-react-native';

// --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
// Sau này bạn có thể thay thế bằng dữ liệu lấy từ API
const SORT_OPTIONS = [ // Các tùy chọn sắp xếp
    { id: 'popularity.desc', label: 'Phổ biến nhất' },
    { id: 'vote_average.desc', label: 'Đánh giá cao' },
    { id: 'release_date.desc', label: 'Mới nhất' },
    { id: 'revenue.desc', label: 'Doanh thu' },
];

const GENRES = [ // Danh sách thể loại phim
    { id: 28, name: "Hành động" },
    { id: 12, name: "Phiêu lưu" },
    { id: 16, name: "Hoạt hình" },
    { id: 35, name: "Hài" },
    { id: 80, name: "Tội phạm" },
    { id: 18, name: "Tâm lý" },
    { id: 10751, name: "Gia đình" },
    { id: 14, name: "Giả tưởng" },
    { id: 36, name: "Lịch sử" },
    { id: 27, name: "Kinh dị" },
    { id: 10402, name: "Âm nhạc" },
    { id: 9648, name: "Bí ẩn" },
    { id: 10749, name: "Lãng mạn" },
    { id: 878, name: "Khoa học viễn tưởng" },
    { id: 10770, name: "Phim truyền hình" },
    { id: 53, name: "Gây cấn" },
    { id: 10752, name: "Chiến tranh" },
    { id: 37, name: "Miền Tây" },
];

const REGIONS = [ // Danh sách quốc gia sản xuất
    { id: 'all', name: "Tất cả" },
    { id: 'US', name: "Âu Mỹ" },
    { id: 'VN', name: "Việt Nam" },
    { id: 'KR', name: "Hàn Quốc" },
    { id: 'CN', name: "Trung Quốc" },
    { id: 'JP', name: "Nhật Bản" },
];

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU (INTERFACES) ---
// Kiểu dữ liệu cho bộ lọc
export interface FilterValues {
    sort_by: string;          // Sắp xếp theo (ví dụ: 'popularity.desc')
    with_genres: number[];    // Mảng chứa ID các thể loại đã chọn
    region: string;           // Mã quốc gia
    year_min: string;         // Năm bắt đầu
    year_max: string;         // Năm kết thúc
    vote_average_gte: number; // Điểm đánh giá tối thiểu (Greater Than or Equal)
}

// Props (tham số đầu vào) cho Component FilterForm
interface FilterFormProps {
    initialValues?: Partial<FilterValues>; // Giá trị khởi tạo (tùy chọn)
    onApply: (values: FilterValues) => void; // Hàm callback khi nhấn "Áp dụng"
    onClose: () => void; // Hàm callback khi nhấn nút đóng "X"
}

// Giá trị mặc định ban đầu của bộ lọc
const DEFAULT_FILTERS: FilterValues = {
    sort_by: 'popularity.desc',
    with_genres: [],
    region: 'all',
    year_min: '',
    year_max: '',
    vote_average_gte: 0,
};

export default function FilterForm({ initialValues, onApply, onClose }: FilterFormProps) {
    // Khởi tạo state filters với giá trị mặc định hoặc giá trị truyền vào
    const [filters, setFilters] = useState<FilterValues>({ ...DEFAULT_FILTERS, ...initialValues });

    // --- CÁC HÀM XỬ LÝ (HANDLERS) ---

    // Hàm chọn/bỏ chọn thể loại (Multi-select logic)
    const toggleGenre = (id: number) => {
        setFilters(prev => {
            const current = prev.with_genres;
            if (current.includes(id)) {
                // Nếu đã có -> Loại bỏ khỏi mảng
                return { ...prev, with_genres: current.filter(g => g !== id) };
            } else {
                // Nếu chưa có -> Thêm vào mảng
                return { ...prev, with_genres: [...current, id] };
            }
        });
    };

    // Hàm đặt lại bộ lọc về mặc định
    const handleReset = () => {
        setFilters(DEFAULT_FILTERS);
    };

    // Component phụ để render tiêu đề cho mỗi phần (Section Title)
    const renderSectionTitle = (title: string, icon?: React.ReactNode) => (
        <View className="flex-row items-center mb-3 mt-6">
            {icon && <View className="mr-2">{icon}</View>}
            <Text className="text-white text-lg font-bold uppercase tracking-wider">{title}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-zinc-950">
            {/* --- HEADER (PHẦN ĐẦU TRANG) --- */}
            {/* Kiểm tra hệ điều hành để chỉnh padding top cho phù hợp với tai thỏ iPhone */}
            <View className={`flex-row justify-between items-center px-4 border-b border-zinc-800 ${Platform.OS === 'ios' ? 'pt-12 pb-4' : 'pv-4 h-16'}`}>
                {/* Nút đóng (X) */}
                <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                    <X size={24} color="#d4d4d8" />
                </TouchableOpacity>

                {/* Tiêu đề */}
                <Text className="text-white text-xl font-bold">Bộ lọc phim</Text>

                {/* Nút đặt lại (Reset) */}
                <TouchableOpacity onPress={handleReset} className="p-2 -mr-2">
                    <RotateCcw size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {/* --- BODY (PHẦN NỘI DUNG CHÍNH - CÓ THỂ CUỘN) --- */}
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

                {/* 1. SẮP XẾP THEO */}
                {renderSectionTitle("Sắp xếp theo")}
                <View className="flex-row flex-wrap gap-3">
                    {SORT_OPTIONS.map(opt => {
                        const isSelected = filters.sort_by === opt.id; // Kiểm tra xem option này có đang được chọn không
                        return (
                            <TouchableOpacity
                                key={opt.id}
                                onPress={() => setFilters({ ...filters, sort_by: opt.id })}
                                // Đổi màu nền và viền nếu đang được chọn (Selected state logic)
                                className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-red-600 border-red-600' : 'bg-zinc-900 border-zinc-700'}`}
                            >
                                <Text className={`${isSelected ? 'text-white font-bold' : 'text-zinc-400'}`}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* 2. THỂ LOẠI (CHỌN NHIỀU) */}
                {renderSectionTitle("Thể loại")}
                <View className="flex-row flex-wrap gap-2">
                    {GENRES.map(genre => {
                        const isSelected = filters.with_genres.includes(genre.id);
                        return (
                            <TouchableOpacity
                                key={genre.id}
                                onPress={() => toggleGenre(genre.id)}
                                // Style: Nếu chọn thì viền đỏ + nền đỏ nhạt. Nếu không thì màu tối.
                                className={`px-3 py-2 rounded-lg border ${isSelected ? 'bg-red-600/20 border-red-600' : 'bg-zinc-900 border-zinc-800'}`}
                            >
                                <Text className={`${isSelected ? 'text-red-500 font-semibold' : 'text-zinc-400'}`}>
                                    {genre.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* 3. QUỐC GIA (SCROLL NGANG) */}
                {renderSectionTitle("Quốc gia")}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {REGIONS.map(region => {
                        const isSelected = filters.region === region.id;
                        return (
                            <TouchableOpacity
                                key={region.id}
                                onPress={() => setFilters({ ...filters, region: region.id })}
                                // Style: Nếu chọn thì nền trắng chữ đen nổi bật
                                className={`mr-3 px-4 py-3 rounded-xl border items-center justify-center min-w-[80px] ${isSelected ? 'bg-white border-white' : 'bg-zinc-900 border-zinc-800'}`}
                            >
                                <Text className={`${isSelected ? 'text-black font-bold' : 'text-zinc-400'}`}>
                                    {region.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* 4. NĂM PHÁT HÀNH & KHOẢNG THỜI GIAN */}
                <View className="flex-row gap-4 mt-2">
                    <View className="flex-1">
                        {renderSectionTitle("Năm phát hành", <Calendar size={18} color="#ef4444" />)}
                        <View className="flex-row items-center gap-2">
                            {/* Input Năm Từ (Min Year) */}
                            <TextInput
                                className="flex-1 bg-zinc-900 text-white p-3 rounded-lg border border-zinc-700 text-center"
                                placeholder="Từ"
                                placeholderTextColor="#52525b"
                                keyboardType="numeric"
                                value={filters.year_min}
                                onChangeText={t => setFilters({ ...filters, year_min: t })}
                                maxLength={4}
                            />
                            <Text className="text-zinc-500">-</Text>
                            {/* Input Năm Đến (Max Year) */}
                            <TextInput
                                className="flex-1 bg-zinc-900 text-white p-3 rounded-lg border border-zinc-700 text-center"
                                placeholder="Đến"
                                placeholderTextColor="#52525b"
                                keyboardType="numeric"
                                value={filters.year_max}
                                onChangeText={t => setFilters({ ...filters, year_max: t })}
                                maxLength={4}
                            />
                        </View>
                    </View>
                </View>

                {/* 5. ĐIỂM ĐÁNH GIÁ (RATING) */}
                {renderSectionTitle("Điểm tối thiểu", <Star size={18} color="#eab308" />)}
                <View className="flex-row justify-between mb-8 bg-zinc-900 p-1 rounded-xl">
                    {/* Các mức điểm: 0 (Tất cả), 5+, 6+... */}
                    {[0, 5, 6, 7, 8, 9].map(score => {
                        const isSelected = filters.vote_average_gte === score;
                        return (
                            <TouchableOpacity
                                key={score}
                                onPress={() => setFilters({ ...filters, vote_average_gte: score })}
                                className={`flex-1 items-center py-3 rounded-lg ${isSelected ? 'bg-yellow-600' : 'bg-transparent'}`}
                            >
                                <Text className={`font-bold ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                                    {score > 0 ? `${score}+` : 'All'}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                {/* Khoảng trống đệm dưới cùng để nội dung không bị che bởi nút Áp dụng */}
                <View className="h-24" />
            </ScrollView>

            {/* --- FOOTER (NÚT ÁP DỤNG CỐ ĐỊNH Ở DƯỚI) --- */}
            <View className={`absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-zinc-950/95 blur-md ${Platform.OS === 'ios' ? 'pb-8' : 'pb-4'}`}>
                <TouchableOpacity
                    className="bg-red-600 w-full py-4 rounded-xl items-center shadow-lg shadow-red-900/50 flex-row justify-center gap-2"
                    onPress={() => onApply(filters)}
                >
                    <Check size={20} color="white" />
                    <Text className="text-white text-lg font-bold uppercase">Áp dụng bộ lọc</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
