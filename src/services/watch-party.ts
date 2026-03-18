import api from '@/services/api';
import { PartyRoom, RoomStatus } from '@/types/watch-party';

export const watchPartyService = {
    getAllRooms: async (filter: RoomStatus = 'live', searchQuery = ''): Promise<PartyRoom[]> => {
        const response = await api.get<PartyRoom[]>('/watch-party', {
            params: {
                filter: filter,
                q: searchQuery
            }
        });
        return response.data;
    },

    joinByCode: async (code: string): Promise<{ roomId: string, message: string }> => {
        const response = await api.post<{ roomId: string, message: string }>('/watch-party/join', { code });
        return response.data;
    },

    createRoom: async (data: { title: string, movieId: string, episodeId?: string, isPrivate: boolean, scheduledAt?: string }): Promise<PartyRoom> => {
        const response = await api.post<PartyRoom>('/watch-party', data);
        return response.data;
    }
}