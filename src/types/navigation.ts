export type RootStackParamList = {
    Login: undefined;
    Welcome: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string } | undefined;
    Remote: undefined;
    Filter: undefined;
    Search: { appliedFilters?: any } | undefined;
    WatchParty: undefined;
    WatchPartyRoom: { roomId: string };
};
