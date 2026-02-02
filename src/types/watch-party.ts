export type RoomStatus = "live" | "scheduled" | "ended";

export interface PartyRoom {
    id: string;
    title: string;
    movieTitle: string;
    image: string;
    status: RoomStatus;
    viewers?: number;
    host: string;
    hostAvatar?: string;
    isPrivate: boolean;
    scheduledAt?: string;
    conversationId?: string;
}