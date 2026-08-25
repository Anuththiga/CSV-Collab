import { useEffect, useState } from 'react';

import PostTable from '../components/PostTable';

import {
  getPosts,
  type Post,
  type Pagination,
} from '../services/post.services';

const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] =
    useState<Pagination | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const limit = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getPosts(
          page,
          limit,
          search
        );

        setPosts(response.data);
        setPagination(response.pagination);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load posts'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, search]);

  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  return (
    <div className="posts-page">
      <h1>Posts</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, email"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {loading && <p>Loading...</p>}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <PostTable posts={posts} />

          {pagination && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((current) => current - 1)
                }
              >
                Previous
              </button>

              <span>
                Page {pagination.page} of{' '}
                {pagination.totalPages}
              </span>

              <button
                disabled={
                  page === pagination.totalPages ||
                  pagination.totalPages === 0
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostsPage;