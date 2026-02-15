import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const PostModal = ({ isOpen, onClose, refreshPosts }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); 
  const { token } = useSelector((state) => state.auth);

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

      await axios.post("http://localhost:8080/api/posts", formData, config);
      
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
      <div className="glass-card w-full max-w-xl rounded-3xl p-8 shadow-2xl border-indigo-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create a Post</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <textarea 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-slate-200 h-32 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="What are you working on today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Attach an Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white transition-all cursor-pointer"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
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