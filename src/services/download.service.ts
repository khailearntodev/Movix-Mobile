import api from './api.service';
import {
  DownloadRequestPayload,
  DownloadRequestResponse,
  CompleteDownloadPayload,
  GetDownloadsResponse,
} from '../types/download';

const BASE_PATH = '/downloads';

export const downloadService = {
  requestDownload: async (payload: DownloadRequestPayload): Promise<DownloadRequestResponse> => {
    const response = await api.post(`${BASE_PATH}/request`, payload);
    return response.data;
  },

  completeDownload: async (id: string, payload?: CompleteDownloadPayload): Promise<any> => {
    const response = await api.patch(`${BASE_PATH}/${id}/complete`, payload);
    return response.data;
  },
  removeDownload: async (id: string): Promise<any> => {
    const response = await api.delete(`${BASE_PATH}/${id}`);
    return response.data;
  },
  getDownloads: async (deviceId?: string): Promise<GetDownloadsResponse> => {
    const response = await api.get(BASE_PATH, {
      params: deviceId ? { deviceId } : undefined,
    });
    return response.data;
  },
};
