import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../redux/slices/authSlice';

const EditProfileModal = ({ isOpen, onClose }) => {
  // 1. Pull current user and token from Redux
  const { user, token } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    headline: user?.headline || "",
    about: user?.about || "",
    skills: user?.skills?.join(", ") || ""
  });
  
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 2. Use the token directly from Redux state
      // Ensure "Bearer " prefix has the mandatory space
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      };
      
      const updatedData = { 
        ...formData, 
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s !== "") 
      };

      const res = await axios.put("http://localhost:8080/api/users/profile", updatedData, config);
      
      // 3. Update Redux (which also updates localStorage)
      dispatch(setCredentials(res.data)); 
      
      alert("Profile Updated Successfully!");
      onClose();
    } catch (err) {
      // This catches the 401 Unauthorized
      alert(err.response?.data?.message || "Update Failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-lg rounded-3xl p-8 shadow-2xl border-indigo-500/20">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Professional Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Headline</label>
            <input 
              type="text" 
              value={formData.headline}
              onChange={(e) => setFormData({...formData, headline: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              placeholder="e.g. Full Stack Developer | MERN Expert"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">About</label>
            <textarea 
              rows="3"
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              placeholder="Tell us about your professional journey..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Skills (comma separated)</label>
            <input 
              type="text" 
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              placeholder="React, Node.js, Python..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-600/20">
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-white transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;