import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, ActivityIndicator } from 'react-native';
import { X, RotateCcw, Check, Calendar, Film, Globe, Tag, Shield } from 'lucide-react-native';
import api from '../../services/api.service';

const TYPES = [
    { id: 'all', label: 'Tất cả' },
    { id: 'phim-le', label: 'Phim lẻ' },
    { id: 'phim-bo', label: 'Phim bộ' },
];

const RATINGS = ['Tất cả', 'K (Dưới 13 tuổi)', 'T13', 'T16', 'T18'];

const YEARS = ['Tất cả', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

export interface FilterValues {
    with_genres: string[];
    region: string;
    type: string;
    rating: string;
    year: string;
}

interface FilterFormProps {
    initialValues?: Partial<FilterValues>;
    onApply: (values: FilterValues) => void;
    onClose: () => void;
}

const DEFAULT_FILTERS: FilterValues = {
    with_genres: [],
    region: 'Tất cả',
    type: 'all',
    rating: 'Tất cả',
    year: 'Tất cả',
};

export default function FilterForm({ initialValues, onApply, onClose }: FilterFormProps) {
    const [filters, setFilters] = useState<FilterValues>({ ...DEFAULT_FILTERS, ...initialValues });
    const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
    const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [customYear, setCustomYear] = useState('');

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [genresRes, countriesRes] = await Promise.all([
                    api.get("/movies/genres"),
                    api.get("/movies/countries"),
                ]);
                setGenres((genresRes.data || []).map((g: any) => ({ id: g.id, name: g.name })));
                const mapped = (countriesRes.data || [])
                    .filter((c: any) => c.name)
                    .map((c: any) => ({ id: c.id, name: c.name }));
                setCountries(mapped);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu filter:", err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchFilterData();
    }, []);

    const toggleGenre = (name: string) => {
        if (name === 'Tất cả') {
            setFilters(prev => ({ ...prev, with_genres: [] }));
            return;
        }
        setFilters(prev => {
            const current = prev.with_genres;
            if (current.includes(name)) {
                return { ...prev, with_genres: current.filter(g => g !== name) };
            }
            return { ...prev, with_genres: [...current, name] };
        });
    };

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS);
        setCustomYear('');
    };

    const handleYearInput = (value: string) => {
        setCustomYear(value);
        if (value.trim().length === 4) {
            setFilters(prev => ({ ...prev, year: value.trim() }));
        } else if (value.trim() === '') {
            setFilters(prev => ({ ...prev, year: 'Tất cả' }));
        }
    };

    const renderSectionTitle = (title: string, icon?: React.ReactNode) => (
        <View className="flex-row items-center mb-3 mt-6">
            {icon && <View className="mr-2">{icon}</View>}
            <Text className="text-white text-base font-bold">{title}</Text>
        </View>
    );

    const renderChip = (
        label: string,
        isSelected: boolean,
        onPress: () => void,
        style?: 'pill' | 'block'
    ) => (
        <TouchableOpacity
            onPress={onPress}
            className={`px-3 py-2 rounded-full border ${isSelected
                    ? 'border-green-600 bg-green-600/10'
                    : 'bg-zinc-900 border-zinc-800'
                } ${style === 'block' ? 'flex-1 items-center' : ''}`}
        >
            <Text className={`text-sm ${isSelected ? 'text-green-400 font-bold' : 'text-zinc-400'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-zinc-950">
            <View className={`flex-row justify-between items-center px-4 border-b border-zinc-800 ${Platform.OS === 'ios' ? 'pt-12 pb-4' : 'pv-4 h-16'}`}>
                <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                    <X size={24} color="#d4d4d8" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Bộ lọc phim</Text>
                <TouchableOpacity onPress={handleReset} className="p-2 -mr-2">
                    <RotateCcw size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

                {renderSectionTitle("Quốc gia", <Globe size={18} color="#ef4444" />)}
                {isLoadingData ? (
                    <ActivityIndicator size="small" color="#ef4444" className="self-start" />
                ) : (
                    <View className="flex-row flex-wrap gap-2">
                        {renderChip('Tất cả', filters.region === 'Tất cả', () => setFilters({ ...filters, region: 'Tất cả' }))}
                        {countries.map(c => (
                            <View key={c.id}>
                                {renderChip(c.name, filters.region === c.name, () => setFilters({ ...filters, region: c.name }))}
                            </View>
                        ))}
                    </View>
                )}

                {renderSectionTitle("Loại phim", <Film size={18} color="#ef4444" />)}
                <View className="flex-row gap-3">
                    {TYPES.map(opt => (
                        <TouchableOpacity
                            key={opt.id}
                            onPress={() => setFilters({ ...filters, type: opt.id })}
                            className={`flex-1 items-center px-4 py-3 rounded-xl border ${filters.type === opt.id
                                    ? 'border-green-600 bg-green-600/10'
                                    : 'bg-zinc-900 border-zinc-800'
                                }`}
                        >
                            <Text className={`${filters.type === opt.id ? 'text-green-400 font-bold' : 'text-zinc-400'}`}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {renderSectionTitle("Xếp hạng", <Shield size={18} color="#ef4444" />)}
                <View className="flex-row flex-wrap gap-2">
                    {RATINGS.map(r => (
                        <View key={r}>
                            {renderChip(r, filters.rating === r, () => setFilters({ ...filters, rating: r }))}
                        </View>
                    ))}
                </View>

                {renderSectionTitle("Thể loại", <Tag size={18} color="#ef4444" />)}
                {isLoadingData ? (
                    <ActivityIndicator size="small" color="#ef4444" className="self-start" />
                ) : (
                    <View className="flex-row flex-wrap gap-2">
                        {renderChip('Tất cả', filters.with_genres.length === 0, () => toggleGenre('Tất cả'))}
                        {genres.map(genre => (
                            <View key={genre.id}>
                                {renderChip(
                                    genre.name,
                                    filters.with_genres.includes(genre.name),
                                    () => toggleGenre(genre.name)
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {renderSectionTitle("Năm sản xuất", <Calendar size={18} color="#ef4444" />)}
                <View className="flex-row flex-wrap gap-2">
                    {YEARS.map(y => (
                        <View key={y}>
                            {renderChip(y, filters.year === y, () => {
                                setFilters({ ...filters, year: y });
                                setCustomYear('');
                            })}
                        </View>
                    ))}
                    <TextInput
                        className="bg-zinc-900 text-white px-3 py-2 rounded-full border border-zinc-800 w-28 text-center text-sm"
                        placeholder="Nhập năm..."
                        placeholderTextColor="#52525b"
                        keyboardType="numeric"
                        value={customYear}
                        onChangeText={handleYearInput}
                        maxLength={4}
                    />
                </View>

                <View className="h-24" />
            </ScrollView>

            <View className={`absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-zinc-950/95 ${Platform.OS === 'ios' ? 'pb-8' : 'pb-4'}`}>
                <TouchableOpacity
                    className="bg-green-600 w-full py-4 rounded-xl items-center shadow-lg flex-row justify-center gap-2"
                    onPress={() => onApply(filters)}
                >
                    <Check size={20} color="white" />
                    <Text className="text-white text-lg font-bold">Lọc kết quả →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
