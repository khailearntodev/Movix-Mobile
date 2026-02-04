// Định nghĩa Interface cho dữ liệu Phim và Bộ lọc

export interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date: string;
    overview: string;
}

export interface PaginationResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

// Params gửi lên API
export interface SearchParams {
    query?: string;
    page: number;
    sort_by?: string;
    with_genres?: string; // string dạng "28,12"
    region?: string;
    primary_release_date_gte?: string;
    primary_release_date_lte?: string;
    vote_average_gte?: number;
    use_ai?: boolean; // Cờ bật AI Search
}
