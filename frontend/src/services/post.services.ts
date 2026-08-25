export interface Post {
  id: number;
  postId: string;
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
  totalPage: number;
}

export interface PostResponse {
  data: Post[];
  pagination: Pagination;
}

const API_URL = 'http://localhost:8080/api';

export const getPosts = async (
  page: number,
  limit: number
): Promise<PostResponse> => {
  const response = await fetch(
    `${API_URL}/posts?page=${page}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
};