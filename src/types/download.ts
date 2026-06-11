export type DownloadStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface DownloadRequestPayload {
  episodeId: string;
  deviceId: string;
}

export interface DownloadRequestResponse {
  success: boolean;
  message: string;
  data: {
    download: {
      id: string;
      status: DownloadStatus;
      // Thêm các fields khác tuỳ backend trả về
      episodeId?: string;
      deviceId?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    videoUrl: string;
  };
}

export interface CompleteDownloadPayload {
  filePath?: string;
  posterPath?: string;
}

// Model download trả về cho list
export interface OfflineDownload {
  id: string;
  status: DownloadStatus;
  episodeId: string;
  deviceId: string;
  filePath?: string;
  posterPath?: string;
  // Các field model đính kèm từ backend
  episode?: any; // Bạn có thể map với interface Episode thực tế
  movie?: any;   // Bạn có thể map với interface Movie thực tế
  createdAt: string;
  updatedAt: string;
}

export interface GetDownloadsResponse {
  success: boolean;
  data: OfflineDownload[];
}
