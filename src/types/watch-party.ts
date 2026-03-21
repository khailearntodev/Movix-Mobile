import { Movie } from "./movie";

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


export interface Message {
    id: string;
    userId: string;
    text: string;
    user: string;
    avatar: string | null;
    time: string;
    isHost: boolean;    
}

export interface WatchPartyMember {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
    online: boolean;
}

export interface RoomData {
    id: string;
    title: string;
    host_user_id: string;
    is_private: boolean;
    join_code?: string;
    movie: any;
    episode?: any;
    scheduled_at?: string;
    started_at?: string;
}