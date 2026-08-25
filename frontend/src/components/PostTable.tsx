import type { Post } from '../services/post.services';

interface PostTableProps {
  posts: Post[];
}

const PostTable = ({ posts }: PostTableProps) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Post ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Version</th>
            <th>Updated By</th>
          </tr>
        </thead>

        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.postId}</td>
              <td>{post.name}</td>
              <td>{post.email}</td>
              <td>{post.version}</td>
              <td>{post.updatedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;