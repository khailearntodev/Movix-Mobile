export type CreditType = 'cast' | 'crew';

export interface Person {
    id: string;
    name: string;
    role_type: string;
    avatar_url: string | null;
    biography?: string |null;
    birthday?: string | null;
    gender?: number;
    movie_people?: PersonCredit[];
  }
  
  export interface PersonCredit {
    id: string;
    character?: string;
    credit_type: CreditType;
    movie:
    {
      id: string;
      title: string;
      originaml_title: string;
      poster_url: string | null;
      slug: string;
      release_date: string | null;
    };
  }
