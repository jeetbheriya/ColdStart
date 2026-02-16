import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
import { FaRegCommentDots } from 'react-icons/fa';
import { RiShareForwardLine } from 'react-icons/ri';

const PostCard = ({ post, refreshPosts }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [shareStatus, setShareStatus] = useState("Share");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Improved owner check to handle both string IDs and populated objects
  // NEW ROBUST COMPARISON
const loggedInUserId = user?._id || user?.id;
const postOwnerId = post.user?._id || post.user;

const isOwner = loggedInUserId && postOwnerId && 
                loggedInUserId.toString() === postOwnerId.toString();
  const hasLiked = post.likes?.includes(user?._id);

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ColdStart Engineering Update',
          text: post.content.substring(0, 100),
          url: postUrl,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      setShareStatus("Copied!");
      setTimeout(() => setShareStatus("Share"), 2000);
    }
  };

  const handleLike = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/api/posts/${post._id}/like`, {}, config);
      refreshPosts(); 
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_URL}/api/posts/${post._id}/comment`, { text: commentText }, config);
      setCommentText("");
      setShowCommentInput(false);
      refreshPosts(); 
    } catch (err) {
      alert("Comment failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/api/posts/${post._id}`, config);
      refreshPosts();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/api/posts/${post._id}`, { content: editContent }, config);
      setIsEditing(false);
      refreshPosts(); 
    } catch (err) {
      alert("Failed to update post");
    }
  };

  return (
    <div className="bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linkedin-blue rounded-full flex items-center justify-center font-bold text-white">
            {post.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-linkedin-text-primary">{post.user?.name}</h4>
            <p className="text-xs text-linkedin-text-secondary">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-linkedin-text-secondary hover:text-linkedin-blue transition-colors text-xs font-medium">Edit</button>
            )}
            <button onClick={handleDelete} className="text-red-600 hover:text-red-800 transition-colors text-xs font-medium">Delete</button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea 
            className="w-full bg-linkedin-background border border-linkedin-border rounded-md p-3 text-linkedin-text-primary text-sm outline-none focus:ring-1 focus:ring-linkedin-blue resize-none"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={handleUpdate} className="bg-linkedin-blue hover:bg-opacity-90 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity">Save</button>
            <button onClick={() => { setIsEditing(false); setEditContent(post.content); }} className="bg-linkedin-background border border-linkedin-border text-linkedin-text-secondary px-4 py-1.5 rounded-full text-xs font-semibold transition-colors hover:bg-linkedin-border">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-linkedin-text-primary text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
          {post.image && (
            <div className="mb-3 overflow-hidden rounded-md border border-linkedin-border">
              <img src={post.image} alt="Post Content" className="w-full h-auto object-cover max-h-[400px]" />
            </div>
          )}
        </>
      )}

      <div className="flex justify-between items-center text-xs text-linkedin-text-secondary mb-3 pb-2 border-b border-linkedin-border">
        <span>{post.likes?.length || 0} Likes</span>
        <span>{post.comments?.length || 0} Comments</span>
      </div>

      <div className="flex justify-around border-t border-linkedin-border pt-3">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${hasLiked ? 'text-linkedin-blue' : 'text-linkedin-text-secondary hover:bg-linkedin-background'}`}
        >
          {hasLiked ? <AiFillLike className="text-lg" /> : <AiOutlineLike className="text-lg" />} {hasLiked ? 'Liked' : 'Like'}
        </button>
        <button 
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium text-linkedin-text-secondary hover:bg-linkedin-background"
        >
          <FaRegCommentDots className="text-lg" /> Comment
        </button>
        <button 
          onClick={handleShare}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${shareStatus === "Copied!" ? "text-green-600" : "text-linkedin-text-secondary hover:bg-linkedin-background"}`}
        >
          <RiShareForwardLine className="text-lg" /> {shareStatus}
        </button>
      </div>

      {showCommentInput && (
        <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
          <input 
            type="text"
            placeholder="Add a comment..."
            className="flex-grow bg-linkedin-background border border-linkedin-border rounded-full px-4 py-2 text-sm text-linkedin-text-primary outline-none focus:ring-1 focus:ring-linkedin-blue"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="bg-linkedin-blue text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-opacity-90">Post</button>
        </form>
      )}

      {/* Owner-only comment content visibility logic */}
      <div className="mt-4 space-y-2">
        {post.comments?.length > 0 && (
          <div className="border-t border-linkedin-border pt-3">
            {post.comments.map((comment) => (
              <div key={comment._id} className="bg-linkedin-background p-3 rounded-lg mb-2">
                <p className="font-semibold text-sm text-linkedin-text-primary">{comment.user?.name || "User"}</p>
                <p className="text-xs text-linkedin-text-secondary">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;