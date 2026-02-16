import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../redux/slices/authSlice';

const EditProfileModal = ({ isOpen, onClose }) => {
  // 1. Pull current user and token from Redux
  const { user, token } = useSelector((state) => state.auth);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  
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

      const res = await axios.put(`${API_URL}/api/users/profile`, updatedData, config);
      
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
      <div className="glass-card w-full max-w-lg rounded-3xl p-8 shadow-2xl border-linkedin-border bg-linkedin-card">
        <h2 className="text-2xl font-bold text-linkedin-text-primary mb-6">Edit Professional Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-linkedin-text-secondary uppercase tracking-widest">Headline</label>
            <input 
              type="text" 
              value={formData.headline}
              onChange={(e) => setFormData({...formData, headline: e.target.value})}
              className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-linkedin-blue text-linkedin-text-primary"
              placeholder="e.g. Full Stack Developer | MERN Expert"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-linkedin-text-secondary uppercase tracking-widest">About</label>
            <textarea 
              rows="3"
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-linkedin-blue text-linkedin-text-primary"
              placeholder="Tell us about your professional journey..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-linkedin-text-secondary uppercase tracking-widest">Skills (comma separated)</label>
            <input 
              type="text" 
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-linkedin-blue text-linkedin-text-primary"
              placeholder="React, Node.js, Python..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 bg-linkedin-blue hover:bg-linkedin-blue/80 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-linkedin-blue/20">
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-linkedin-border hover:bg-linkedin-text-secondary/20 py-3 rounded-xl font-bold text-linkedin-text-primary transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;