export const getBlogEngagement = (item: any, currentUserId?: string) => {
  const likes = Array.isArray(item?.likes) ? item.likes : [];
  const bookmarks = Array.isArray(item?.bookmarks) ? item.bookmarks : [];

  const likeCount = Number((item?.like_count ?? item?.likes_count ?? item?._count?.likes) || 0);
  const commentCount = Number((item?.comment_count ?? item?.comments_count ?? item?._count?.comments) || 0);
  const bookmarkCount = Number((item?.bookmark_count ?? item?.bookmarks_count ?? item?._count?.bookmarks) || 0);

  const isLiked = typeof item?.is_liked === 'boolean'
    ? item.is_liked
    : currentUserId
      ? likes.some((like: any) => like.user_id === currentUserId)
      : false;

  const isBookmarked = typeof item?.is_bookmarked === 'boolean'
    ? item.is_bookmarked
    : currentUserId
      ? bookmarks.some((bookmark: any) => bookmark.user_id === currentUserId)
      : false;

  return {
    likeCount,
    commentCount,
    bookmarkCount,
    isLiked,
    isBookmarked,
  };
};
