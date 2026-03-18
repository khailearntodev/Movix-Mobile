import api from '@/services/api';
import {Person}  from '@/types/person';

interface PeopleResponse {
    data: Person[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const peopleService = {
    getAll: async (page = 1, limit = 20, search = ''): Promise<PeopleResponse> => {
        const params = { page, limit, q: search };
        const response = await api.get<PeopleResponse>('/people', { params });
        return response.data;
    },
    
    getDetail: async (personId: string): Promise<Person> => {
        const response = await api.get<Person>('/people/' + personId);
        return response.data;
    }
}