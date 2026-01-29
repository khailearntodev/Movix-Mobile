import { Movie } from "./movie";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Main: undefined; 
  MovieDetail: { movie: Movie }; 
  Remote: undefined; 
};