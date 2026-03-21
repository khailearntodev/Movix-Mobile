export  interface Actor{
    id: number | string;
    name: string;
    character?: string; 
    profileUrl?: string; 
    imageUrl?: string;   
    avatar_url?: string | null;
    biography?: string | null;
    birthday?: string | null; 
    gender?: number | null;
}