import { Movie } from "./movie";

export type RootStackParamList = {
  Login: undefined;
    Welcome: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Main: undefined; 
  MovieDetail: { movie: Movie }; 
  Remote: undefined; 
    Filter: undefined;
    Search: { appliedFilters?: any } | undefined;
    WatchParty: undefined;
    Playlist: undefined;
    Favorites: undefined;
    History: undefined;
    EditProfile: undefined;
    Notifications: undefined;
    Subscription: undefined;
};