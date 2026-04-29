import api from './api.service';
import { Banner } from '../types/banner';

const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/original';

const formatUrl = (path: string | null | undefined) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${TMDB_IMAGE_URL}${path}`;
};

export const bannerService = {
  getBanners: async (): Promise<Banner[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await api.get<any>('/banners');
      const items = Array.isArray(data) ? data : data.data;
      if (!Array.isArray(items)) return [];

      return items.map((item: any) => ({
        id: item.id,
        title: item.title,
        imageUrl: formatUrl(item.image_url),
        linkUrl: item.link_url || "#",
        isActive: item.is_active,
        movieId: item.movie_id,
        description: item.description,
        movie: item.movie ? {
          ...item.movie,
          id: item.movie.id,
          title: item.movie.title || item.movie.original_title,
          description: item.movie.description || item.movie.overview,
          posterUrl: formatUrl(item.movie.poster_url || item.movie.poster_path),
          backdropUrl: formatUrl(item.movie.backdrop_url || item.movie.backdrop_path),
          releaseYear: item.movie.release_date ? new Date(item.movie.release_date).getFullYear() : undefined,
          vote_average: item.movie.vote_average,
          type: item.movie.media_type === 'TV' ? 'TV' : 'MOVIE',
        } : undefined
      }));
    } catch (error) {
      console.error("Lỗi lấy banner:", error);
      return [];
    }
  },
};

