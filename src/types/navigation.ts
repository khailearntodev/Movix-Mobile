import { Movie } from "./movie";

export type RootStackParamList = {
  Login: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Main: undefined;
  MovieDetail: { movie: Movie };
  Remote: undefined;
  Filter: undefined;
  Search: { appliedFilters?: any } | undefined;
  WatchParty: undefined;
  WatchPartyRoom: { roomId: string };
  Playlist: undefined;
  PlaylistDetail: { playlistId: string; title: string };
  Favorites: undefined;
  History: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  Downloads: undefined;
  Subscription: undefined;
  PaymentWebView: {
    paymentUrl: string;
    paymentMethod?: string;
    orderCode?: string | number;
  };
  Transactions: undefined;
  WatchMovie: { movie: Movie; episodeId?: string; offlineUrl?: string };
  AIChat: undefined;
  People: undefined;
  PersonDetail: { personId: string };
  BlogDetail: { id: string; slug: string };
  CreateBlog: undefined;
  BlogSearch: undefined;
};
