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

export interface ConflictData {
    current: Post;
    requested: {
        name: string;
        email: string;
        version: number;
    };
}

export class ConflictError extends Error {
    conflictData: ConflictData;

    constructor(
        message: string,
        conflictData: ConflictData
    ) {
        super(message);
        this.name = 'ConflictError';
        this.conflictData = conflictData;
    }
}

export const updatePost = async (
    id: number,
    name: string,
    email: string,
    version: number
): Promise<Post> => {
    const response = await fetch(
        `${API_URL}/posts/${id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                version,
            }),
        }
    );

    const result = await response.json();

    if (response.status === 409) {
        throw new ConflictError(
            result.message,
            result.data
        );
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            'Failed to update post'
        );
    }

    return result.data;
};