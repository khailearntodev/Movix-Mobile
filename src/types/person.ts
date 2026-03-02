export interface Person {
    id: number;
    name: string;
    role: string;
    profilePath: string | null;
    biography?: string;
    birthday?: string;
    placeOfBirth?: string;
    gender?: number;
    credits?: PersonCredit[];
  }
  
  export interface PersonCredit {
    id: number;
    title: string;
    posterPath: string | null;
    character?: string;
    job?: string;
    year?: string;
    mediaType: 'movie' | 'tv';
    voteAverage?: number;
  }
