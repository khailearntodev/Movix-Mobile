import api from './api.service';
import type { ReportPayload } from '../types/report';

export const reportService = {
  createReport: async (payload: ReportPayload) => {
    const response = await api.post('/reports', payload);
    return response.data;
  },
};
