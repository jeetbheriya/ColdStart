import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import PostJobModal from "../components/PostJobModal";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Use a Ref to trigger the hidden file input
  const fileInputRef = useRef(null);

  const { user, token } = useSelector((state) => state.auth);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/jobs");
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJob(res.data[0]);
    } catch (err) {
      console.error("Error fetching jobs", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Function to trigger the file browser
  const triggerFileInput = () => {
    if (user?.role === 'company') {
      return alert("Companies cannot apply for jobs.");
    }
    fileInputRef.current.click();
  };

  // 2. Function to handle the actual upload once a file is chosen
  const handleApply = async (e) => {
    if (!selectedJob) return;
    
    const file = e.target.files[0];
    if (!file) return;

    // Compulsory check for document types
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return alert("Please upload a PDF or Word document.");
    }

    const formData = new FormData(); 
    formData.append("resume", file);

    try {
      const res = await axios.post(
        `http://localhost:8080/api/applications/apply/${selectedJob._id}`, 
        formData, 
        { headers: { 
            Authorization: `Bearer ${token}`, 
          } 
        }
      );
      alert("Applied successfully with resume! 🚀");
      // Reset the file input so the same file can be uploaded again if needed
      e.target.value = null; 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed.");
    }
  };
  
  const handleDelete = async (jobId) => {
    if (window.confirm("Confirm deletion of this opening?")) {
      try {
        await axios.delete(`http://localhost:8080/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchJobs(); 
        setSelectedJob(null); 
        alert("Opening deleted successfully.");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsPostModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPostModalOpen(false);
    setIsEditing(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-[1400px]">
        <Navbar />
        
        {/* Hidden File Input */}
<input 
  type="file" 
  ref={fileInputRef} 
  className="hidden" 
  accept=".pdf,.doc,.docx"
  onChange={(e) => handleApply(e)} // Pass the event explicitly if needed
/>

        <div className="flex justify-between items-center mb-6">
          <div className="px-2 text-left">
            <h1 className="text-2xl font-bold tracking-tight">Engineering Opportunities</h1>
            <p className="text-slate-500 text-sm">ColdStart Career Hub</p>
          </div>
          {user?.role === "company" && (
            <button 
              onClick={() => { setIsEditing(false); setIsPostModalOpen(true); }} 
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              + Post New
            </button>
          )}
        </div>

        <div className="grid grid-cols-12 gap-6 h-[78vh]">
          {/* Left List */}
          <div className="col-span-4 glass-card rounded-3xl overflow-y-auto custom-scrollbar border border-slate-800">
            {loading ? (
              <div className="p-10 text-center animate-pulse text-indigo-500 font-bold">Scanning opportunities...</div>
            ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <div 
                    key={job._id} 
                    onClick={() => setSelectedJob(job)} 
                    className={`p-5 border-b border-slate-800 text-left cursor-pointer transition-all hover:bg-slate-900/40 ${selectedJob?._id === job._id ? "bg-indigo-500/10 border-r-4 border-r-indigo-500" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-indigo-400 font-bold text-sm">{job.title}</h3>
                      <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold uppercase">{job.category}</span>
                    </div>
                    <p className="text-white text-xs mt-1 font-semibold">{job.company}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                       <span className="text-[10px] text-green-400 font-bold tracking-tighter uppercase">Reviewing</span>
                    </div>
                  </div>
                ))
            ) : (
                <div className="p-10 text-center text-slate-500 italic">No openings found.</div>
            )}
          </div>

          {/* Detailed View */}
          <div className="col-span-8 glass-card rounded-3xl p-10 overflow-y-auto custom-scrollbar border border-slate-800">
            {selectedJob ? (
              <div className="animate-in fade-in duration-500 text-left">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-4xl font-black text-white leading-tight">{selectedJob.title}</h1>
                    <p className="text-indigo-400 font-bold text-lg">{selectedJob.company} • {selectedJob.location}</p>
                  </div>
                  
                  {user?.role === 'company' && selectedJob.postedBy === user.id && (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleEditClick}
                        className="text-indigo-400 hover:bg-indigo-500/10 p-2 rounded-lg transition-all text-xs font-bold border border-indigo-500/20"
                      >
                        📝 EDIT
                      </button>
                      <button 
                        onClick={() => handleDelete(selectedJob._id)}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all text-xs font-bold border border-red-500/20"
                      >
                        🗑️ DELETE
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mb-10">
                  {/* Updated Apply Button */}
                  <button 
                    onClick={triggerFileInput} 
                    disabled={user?.role === 'company'}
                    className={`px-10 py-3 rounded-xl font-black shadow-lg transition-all ${
                        user?.role === 'company' 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                    }`}
                  >
                    Apply Now 🚀
                  </button>
                  <button className="border border-slate-700 px-10 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-slate-300">
                    Save
                  </button>
                </div>

                {/* Rest of Info Grid and Sections */}
                <div className="grid grid-cols-2 gap-y-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 mb-10 text-sm">
                   <p><span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Category</span> <span className="text-indigo-300 font-bold">{selectedJob.category}</span></p>
                   <p><span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Stipend / Salary</span> <span className="text-slate-200 font-bold">{selectedJob.stipend || 'Competitive'}</span></p>
                   <p><span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Duration</span> <span className="text-slate-200 font-bold">{selectedJob.duration || 'Full-time'}</span></p>
                   <p><span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Experience</span> <span className="text-slate-200 font-bold">{selectedJob.experience || 'Fresher'}</span></p>
                </div>

                <div className="space-y-10">
                  <section>
                    <h3 className="text-sm font-black uppercase text-indigo-500 border-b border-slate-800 pb-2 mb-4 tracking-widest">Job Description</h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                  </section>
                  {/* ... other sections remain the same ... */}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                <div className="text-6xl mb-4 grayscale opacity-20 text-indigo-500">💼</div>
                Select an opening to view full details
              </div>
            )}
          </div>
        </div>
      </div>
      <PostJobModal 
        isOpen={isPostModalOpen} 
        onClose={handleCloseModal} 
        refreshJobs={fetchJobs}
        isEditing={isEditing}
        editData={selectedJob}
      />
    </div>
  );
};

export default Jobs;