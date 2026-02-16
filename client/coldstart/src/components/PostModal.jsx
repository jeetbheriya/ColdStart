import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const PostModal = ({ isOpen, onClose, refreshPosts }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); 
  const { token } = useSelector((state) => state.auth);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image); // Key matches backend Multer storage

    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`, // Token from local storage
          "Content-Type": "multipart/form-data" 
        } 
      };

      await axios.post(`${API_URL}/api/posts`, formData, config);
      
      // Reset state so modal is clean next time
      setContent("");
      setImage(null);
      
      onClose();
      refreshPosts(); // Updates Landing feed
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="glass-card w-full max-w-xl rounded-3xl p-8 shadow-2xl border-linkedin-border bg-linkedin-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-linkedin-text-primary">Create a Post</h2>
          <button onClick={onClose} className="text-linkedin-text-secondary hover:text-linkedin-blue text-2xl">×</button>
        </div>
        
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <textarea 
            className="w-full bg-linkedin-background border border-linkedin-border rounded-2xl p-4 text-linkedin-text-primary h-32 outline-none focus:ring-2 focus:ring-linkedin-blue resize-none"
            placeholder="What are you working on today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-linkedin-text-secondary uppercase tracking-widest">Attach an Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="block w-full text-sm text-linkedin-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-linkedin-blue file:text-white transition-all cursor-pointer"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              className="bg-linkedin-blue hover:bg-linkedin-blue/80 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-linkedin-blue/30 transition-all active:scale-95"
            >
              Post to Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;