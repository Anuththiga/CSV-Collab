import { useEffect, useState } from 'react';
import PostTable from '../components/PostTable';
import UploadCsv from '../components/UploadCsv';
import socket from '../services/socket';
import ConflictModal from '../components/ConflictModal';

import {
    getPosts,
    updatePost,
    type Post,
    type Pagination,
    type ConflictData,
    ConflictError
} from '../services/post.services';

const PostsPage = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [pagination, setPagination] =
        useState<Pagination | null>(null);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [conflict, setConflict] = useState<ConflictData | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const limit = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [search]);

    useEffect(() => {
        const handlePostUpdated = (updatedPost: Post) => {
            console.log('Real-time post update received:', updatedPost);

            setPosts((currentPosts) =>
                currentPosts.map((post) =>
                    post.id === updatedPost.id
                        ? {
                            ...post,
                            ...updatedPost,
                        } : post
                )
            );
        };

        socket.on(
            'post:updated',
            handlePostUpdated
        );

        return () => {
            socket.off(
                'post:updated',
                handlePostUpdated
            );
        };
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await getPosts(
                    page,
                    limit,
                    debouncedSearch
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
    }, [page, debouncedSearch, refreshKey]);

    const handleSearch = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearch(event.target.value);
        setPage(1);
    };

    const handleUpdate = async (
        id: number,
        name: string,
        email: string,
        version: number
    ): Promise<void> => {
        try {
            setError('');

            const updatedPost = await updatePost(
                id,
                name,
                email,
                version
            );

            setPosts((currentPosts) =>
                currentPosts.map((post) =>
                    post.id === updatedPost.id
                        ? updatedPost
                        : post
                )
            );

        } catch (error) {

            if (error instanceof ConflictError) {
                setConflict(
                    error.conflictData
                );

                return;
            }

            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update post'
            );

            throw error;
        }
    };
    return (
        <div className="posts-page">
            <h1>Posts</h1>
            <UploadCsv
                onUploadComplete={() => {
                    setPage(1);
                    setRefreshKey((val) => val + 1);
                }}
            />
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
                    <PostTable posts={posts} onUpdate={handleUpdate} />

                    {pagination && (
                        <div className="pagination">
                            <button
                                type='button'
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
                                type='button'
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
            {conflict && (
                <ConflictModal
                    conflict={conflict}

                    onKeepCurrent={() => {
                        setConflict(null);
                    }}

                    onKeepMine={() => {
                        setConflict(null);
                    }}

                    onCancel={() => {
                        setConflict(null);
                    }}
                />
            )}
        </div>
    );
};

export default PostsPage;