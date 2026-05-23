import api from './api.service';
export interface GetAllBlogsParams {
  page?: number;
  limit?: number;
  movieId?: string;
  userId?: string;
  isSpoiler?: boolean | string;
  search?: string;
}

export interface GetSavedBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
            }

export const blogService = {

  getAllBlogs: async (params?: GetAllBlogsParams) => {
    const response = await api.get("/blogs", { params });
    return response.data;
  },

  getSavedBlogs: async (params?: GetSavedBlogsParams) => {
    const response = await api.get("/blogs/bookmarks", { params });
    return response.data;
  },

  getBlogById: async (id: string) => {
    const response = await api.get(`/blogs/id/${id}`);
    return response.data;
  },

  getBlogBySlug: async (slug: string) => {
    const response = await api.get(`/blogs/slug/${slug}`);
    return response.data;
  },

  getUserBlogs: async (userId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/blogs/user/${userId}`, { params });
    return response.data;
  },

  createBlogPost: async (formData: FormData) => {
    const response = await api.post("/blogs", formData, {
      headers: { "Content-Type": undefined }, // để axios tự set multipart boundary
    });
    return response.data;
  },

  updateBlogPost: async (id: string, formData: FormData) => {
    const response = await api.put(`/blogs/${id}`, formData, {
      headers: { "Content-Type": undefined }, // để axios tự set multipart boundary
    });
    return response.data;
  },


  deleteBlogPost: async (id: string) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  toggleLike: async (id: string) => {
    const response = await api.post(`/blogs/${id}/like`);
    return response.data;
  },

  toggleBookmark: async (id: string) => {
    const response = await api.post(`/blogs/${id}/bookmark`);
    return response.data;
  },
};
