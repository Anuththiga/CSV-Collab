import { useState } from 'react';
import type { Post } from '../services/post.services';

interface PostTableProps {
  posts: Post[];
  onUpdate: (
    id: number,
    name: string,
    email: string,
    version: number
  ) => Promise<void>;
}

const PostTable = ({
  posts,
  onUpdate,
}: PostTableProps) => {
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editName, setEditName] =
    useState('');

  const [editEmail, setEditEmail] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [editVersion, setEditVersion] =
    useState<number>(0);


  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setEditName(post.name);
    setEditEmail(post.email);
    setEditVersion(post.version);
  };


  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
    setEditVersion(0);
  };


  const handleSave = async () => {
    if (editingId === null) {
      return;
    }

    try {
      setSaving(true);

      await onUpdate(
        editingId,
        editName,
        editEmail,
        editVersion
      );

      setEditingId(null);
      setEditName('');
      setEditEmail('');
      setEditVersion(0);
    } catch (error) {
      console.error(
        'Update failed:',
        error
      );
    } finally {
      setSaving(false);
    }
  };


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
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {posts.map((post) => {
            const isEditing =
              editingId === post.id;

            return (
              <tr key={post.id}>

                <td>
                  {post.id}
                </td>

                <td>
                  {post.postId}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(event) =>
                        setEditName(
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    post.name
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(event) =>
                        setEditEmail(
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    post.email
                  )}
                </td>

                <td>
                  {post.version}
                </td>

                <td>
                  {post.updatedBy}
                </td>

                <td>
                  {isEditing ? (
                    <>
                      <button
                        type='button'
                        disabled={saving}
                        onClick={
                          handleSave
                        }
                      >
                        {saving
                          ? 'Saving...'
                          : 'Save'}
                      </button>

                      <button
                        type='button'
                        disabled={saving}
                        onClick={
                          handleCancel
                        }
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type='button'
                      onClick={() =>
                        handleEdit(
                          post
                        )
                      }
                    >
                      Edit
                    </button>
                  )}
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;