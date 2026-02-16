import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const PostJobModal = ({ isOpen, onClose, refreshJobs, isEditing, editData }) => {
  const { token } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "Remote",
    category: "Job",
    stipend: "",
    duration: "",
    experience: "",
    description: "",
    companyDescription: "",
    responsibilities: "",
    requirements: "",
    skillsRequired: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Pre-fill data if editing
  useEffect(() => {
    if (isEditing && editData) {
      setFormData({
        title: editData.title || "",
        location: editData.location || "",
        type: editData.type || "Remote",
        category: editData.category || "Job",
        stipend: editData.stipend || "",
        duration: editData.duration || "",
        experience: editData.experience || "",
        description: editData.description || "",
        companyDescription: editData.companyDescription || "",
        // Convert arrays back to strings for textarea display
        responsibilities: editData.responsibilities?.join("\n") || "",
        requirements: editData.requirements?.join("\n") || "",
        skillsRequired: editData.skillsRequired?.join(", ") || "",
      });
    } else {
      // Reset for fresh post
      setFormData({
        title: "", location: "", type: "Remote", category: "Job",
        stipend: "", duration: "", experience: "", description: "",
        companyDescription: "", responsibilities: "", requirements: "", skillsRequired: ""
      });
    }
  }, [isEditing, editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        ...formData,
        skillsRequired: formData.skillsRequired.split(",").map((s) => s.trim()),
        responsibilities: formData.responsibilities.split('\n').filter(line => line.trim()),
        requirements: formData.requirements.split('\n').filter(line => line.trim()),
      };

      if (isEditing) {
        // PUT request for updates
        await axios.put(`${API_URL}/api/jobs/${editData._id}`, jobData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Listing updated successfully!");
      } else {
        // POST request for new listings
        await axios.post(`${API_URL}/api/jobs`, jobData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("New job published successfully!");
      }

      refreshJobs();
      onClose();
    } catch (err) {
      console.error("Action failed:", err);
      alert(`Failed to ${isEditing ? "update" : "post"} job.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-8 my-8 shadow-2xl border border-linkedin-border bg-linkedin-card animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-linkedin-text-primary italic tracking-tighter uppercase">
            {isEditing ? "Update Details" : "Post New Opening"}
          </h2>
          <button onClick={onClose} className="text-linkedin-text-secondary hover:text-linkedin-blue transition-colors text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-linkedin-text-secondary tracking-widest mb-1 block">Job Title</label>
              <input required value={formData.title} className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none focus:ring-2 focus:ring-linkedin-blue" placeholder="e.g. SDE Intern"
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-linkedin-text-secondary tracking-widest mb-1 block">Location</label>
              <input required value={formData.location} className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none focus:ring-2 focus:ring-linkedin-blue" placeholder="e.g. Hyderabad, India"
                onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-linkedin-text-secondary mb-1 block">Opening Category</label>
              <select value={formData.category} className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none focus:ring-2 focus:ring-linkedin-blue"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="Job">Full-time Job</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-linkedin-text-secondary mb-1 block">Work Mode</label>
              <select value={formData.type} className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none focus:ring-2 focus:ring-linkedin-blue"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-left">
            <div>
              <label className="text-[10px] font-black uppercase text-linkedin-text-secondary mb-1 block tracking-widest">Stipend</label>
              <input value={formData.stipend} className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none focus:ring-2 focus:ring-linkedin-blue" placeholder="e.g. 40k/mo"
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-linkedin-text-secondary mb-1 block tracking-widest">Duration</label>
              <input value={formData.duration} className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none focus:ring-2 focus:ring-linkedin-blue" placeholder="e.g. 6 Months"
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-linkedin-text-secondary mb-1 block tracking-widest">Experience</label>
              <input value={formData.experience} className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none focus:ring-2 focus:ring-linkedin-blue" placeholder="e.g. 0-1 Year"
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
            </div>
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black uppercase text-linkedin-text-secondary mb-1 block tracking-widest">Job Description</label>
            <textarea required value={formData.description} rows="3" className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none resize-none focus:ring-2 focus:ring-linkedin-blue" placeholder="General summary..."
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black uppercase text-linkedin-text-secondary mb-1 block tracking-widest">Responsibilities (One per line)</label>
            <textarea value={formData.responsibilities} rows="3" className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none resize-none focus:ring-2 focus:ring-linkedin-blue" placeholder="Bullet points..."
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}></textarea>
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black uppercase text-linkedin-text-secondary mb-1 block tracking-widest">Requirements (One per line)</label>
            <textarea value={formData.requirements} rows="3" className="w-full bg-linkedin-background border border-linkedin-border rounded-xl px-4 py-2 text-sm text-linkedin-text-primary outline-none resize-none focus:ring-2 focus:ring-linkedin-blue" placeholder="Bullet points..."
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}></textarea>
          </div>

          <button type="submit" className="w-full bg-linkedin-blue hover:bg-linkedin-blue/80 text-white font-black py-4 rounded-xl shadow-lg shadow-linkedin-blue/20 transition-all hover:-translate-y-1 uppercase tracking-widest">
            {isEditing ? "Update Listing" : "Publish Job Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJobModal;