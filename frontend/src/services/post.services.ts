export interface Post {
  id: number;
  postId: number;
  name: string;
  email: string;
  pendingData: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PostResponse {
  data: Post[];
  pagination: Pagination;
}

const API_URL = 'http://localhost:8080/api';

export const getPosts = async (
  page: number,
  limit: number,
  search: string
): Promise<PostResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  const response = await fetch(
    `${API_URL}/posts?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
};