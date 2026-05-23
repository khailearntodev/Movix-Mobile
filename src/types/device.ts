export type DeviceType = "desktop" | "mobile" | "tablet" | "tv" | "unknown";

export interface DeviceInfo {
  os: string;
  browser: string;
  deviceId: string;
  deviceType: DeviceType;
  deviceName: string;
}

export interface DeviceSessionResponse {
  id: string;
  device_info: DeviceInfo | null;
  ip_address: string | null;
  last_used_at: string;
  createdAt: string;
}

export interface DeviceSession {
  id: string;
  deviceId: string;
  deviceName: string;
  os: string;
  browser: string;
  deviceType: DeviceType;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
  isCurrentDevice: boolean;
}

export interface DeviceSessionsResponse {
  success: boolean;
  data: DeviceSessionResponse[];
}

export interface RevokeDeviceResponse {
  success: boolean;
  message: string;
}