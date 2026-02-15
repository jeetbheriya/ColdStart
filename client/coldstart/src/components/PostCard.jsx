import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const PostCard = ({ post, refreshPosts }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [shareStatus, setShareStatus] = useState("Share");

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
      await axios.put(`http://localhost:8080/api/posts/${post._id}/like`, {}, config);
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
      await axios.post(`http://localhost:8080/api/posts/${post._id}/comment`, { text: commentText }, config);
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
      await axios.delete(`http://localhost:8080/api/posts/${post._id}`, config);
      refreshPosts();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:8080/api/posts/${post._id}`, { content: editContent }, config);
      setIsEditing(false);
      refreshPosts(); 
    } catch (err) {
      alert("Failed to update post");
    }
  };

  return (
    <div className="group bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 mb-6 hover:bg-slate-900/60 transition-all shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full flex items-center justify-center font-bold text-white ring-2 ring-slate-800">
            {post.user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">{post.user?.name}</h4>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action buttons will now show correctly if IDs match */}
        {isOwner && (
          <div className="flex gap-3">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-indigo-400 transition-colors text-xs font-bold">Edit</button>
            )}
            <button onClick={handleDelete} className="text-slate-600 hover:text-red-400 transition-colors text-xs font-bold">Delete</button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all">Save</button>
            <button onClick={() => { setIsEditing(false); setEditContent(post.content); }} className="bg-slate-700 px-4 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 transition-all">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
          {post.image && (
            <div className="mb-4 overflow-hidden rounded-xl border border-slate-800">
              <img src={post.image} alt="Post Content" className="w-full h-auto object-cover max-h-[400px]" />
            </div>
          )}
        </>
      )}

      {/* Publicly visible stats */}
      <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
        <span>{post.likes?.length || 0} Likes</span>
        <span>{post.comments?.length || 0} Comments</span>
      </div>

      <div className="flex gap-6 border-t border-slate-800/50 pt-4">
        <button 
          onClick={handleLike} 
          className={`text-xs font-bold transition-colors flex items-center gap-2 ${hasLiked ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'}`}
        >
          <span>{hasLiked ? '❤️' : '👍'}</span> {hasLiked ? 'Liked' : 'Like'}
        </button>
        <button 
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-2"
        >
          <span>💬</span> Comment
        </button>
        <button 
          onClick={handleShare}
          className={`text-xs font-bold transition-colors flex items-center gap-2 ${shareStatus === "Copied!" ? "text-green-400" : "text-slate-500 hover:text-indigo-400"}`}
        >
          <span>🚀</span> {shareStatus}
        </button>
      </div>

      {showCommentInput && (
        <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
          <input 
            type="text"
            placeholder="Write a comment..."
            className="flex-grow bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-500">Post</button>
        </form>
      )}

      {/* Owner-only comment content visibility logic */}
      <div className="mt-4 space-y-2">
        {isOwner ? (
          post.comments?.map((comment) => (
            <div key={comment._id} className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-800/50">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{comment.user?.name || "User"}</p>
              <p className="text-xs text-slate-300">{comment.text}</p>
            </div>
          ))
        ) : (
          post.comments?.length > 0 && (
            <p className="text-[10px] italic text-slate-600 px-1">
              {post.comments.length} engineering feedbacks received. Private to author.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default PostCard;