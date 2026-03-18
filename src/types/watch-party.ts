export type RoomStatus = "live" | "scheduled" | "ended";

export interface PartyRoom {
    id: string;
    hostId: string;
    title: string;
    movieTitle?: string;
    originalMovieName?: string;
    image?: string | null;
    host: string;
    hostAvatar?: string | null;
    viewers: number;
    isPrivate: boolean;
    status: RoomStatus;
    scheduledAt?: string;
    startedAt?: string;
    endedAt?: string;
    episodeInfo?: {
        season: number;
        episode: number;
    } | string;
    
    is_active?: boolean;
    schedule_time?: string;
    invite_code?: string;
}
