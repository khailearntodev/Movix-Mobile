// Backend notification types
export type NotificationType =
  | "NEW_MOVIE"
  | "COMMENT_REPLY"
  | "WATCH_PARTY_INVITE"
  | "SYSTEM";

// Backend API response structure
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    movieId?: string;
    movieSlug?: string;
    partyId?: string;
    actionUrl?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string; // ISO string
}

// API response for notifications list
export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    hasNext: boolean;
  };
}

// API response for unread count
export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}