import api from './api.service';
import type {
  DeviceSessionsResponse,
  RevokeDeviceResponse,
} from "@/types/device";

const DEVICE_BASE_URL = "/auth/devices";

export const deviceService = {
  async getLoggedInDevices(): Promise<DeviceSessionsResponse> {
    const response = await api.get<DeviceSessionsResponse>(DEVICE_BASE_URL);
    return response.data;
  },

  async revokeDevice(tokenId: string): Promise<RevokeDeviceResponse> {
    const response = await api.delete<RevokeDeviceResponse>(
      `${DEVICE_BASE_URL}/${tokenId}`,
    );
    return response.data;
  },
};