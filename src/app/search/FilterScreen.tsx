import React from 'react';
import { View, DeviceEventEmitter } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import FilterForm, { FilterValues } from '../../components/search/FilterForm';
import { StatusBar } from 'expo-status-bar';

type FilterProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Filter'>;
};

export default function FilterScreen({ navigation }: FilterProps) {
    const handleApply = (filters: FilterValues) => {
        const cleanFilters = JSON.parse(JSON.stringify(filters));
        console.log("🎬 Emit Event & Close Modal:", cleanFilters);
        DeviceEventEmitter.emit('event.updateFilters', cleanFilters);
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-zinc-950">
            <StatusBar style="light" />
            <FilterForm
                onApply={handleApply}
                onClose={() => navigation.goBack()}
            />
        </View>
    );
}