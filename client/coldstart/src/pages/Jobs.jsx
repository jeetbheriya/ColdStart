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
    <div className="min-h-screen bg-linkedin-background font-system-ui">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-8">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.doc,.docx"
          onChange={(e) => handleApply(e)} // Pass the event explicitly if needed
        />

        <div className="flex justify-between items-center mb-6 bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm p-4">
          <div className="text-left">
            <h1 className="text-xl font-bold text-linkedin-text-primary">Engineering Opportunities</h1>
            <p className="text-linkedin-text-secondary text-sm">ColdStart Career Hub</p>
          </div>
          {user?.role === "company" && (
            <button 
              onClick={() => { setIsEditing(false); setIsPostModalOpen(true); }} 
              className="bg-linkedin-blue hover:bg-opacity-90 text-white px-5 py-2 rounded-full font-semibold transition-opacity"
            >
              + Post New Job
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left List of Jobs */}
          <div className="md:col-span-4 lg:col-span-3 bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm overflow-hidden h-[calc(100vh-200px)]">
            <div className="h-full overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-4 text-center animate-pulse text-linkedin-blue font-bold">Scanning opportunities...</div>
              ) : jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div 
                      key={job._id} 
                      onClick={() => setSelectedJob(job)} 
                      className={`p-4 border-b border-linkedin-border text-left cursor-pointer transition-all hover:bg-linkedin-background ${selectedJob?._id === job._id ? "bg-linkedin-background border-r-4 border-r-linkedin-blue" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-linkedin-blue font-bold text-base">{job.title}</h3>
                        <span className="text-[10px] bg-linkedin-background text-linkedin-text-secondary px-2 py-0.5 rounded-full font-semibold">{job.category}</span>
                      </div>
                      <p className="text-linkedin-text-primary text-sm mt-1 font-semibold">{job.company}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-600 font-semibold">Actively recruiting</span>
                      </div>
                    </div>
                  ))
              ) : (
                  <div className="p-4 text-center text-linkedin-text-secondary italic">No job openings found.</div>
              )}
            </div>
          </div>

          {/* Detailed Job View */}
          <div className="md:col-span-8 lg:col-span-9 bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm p-6 overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
            {selectedJob ? (
              <div className="animate-in fade-in duration-500 text-left">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-linkedin-text-primary leading-tight">{selectedJob.title}</h1>
                    <p className="text-linkedin-text-secondary text-lg">{selectedJob.company} • {selectedJob.location}</p>
                  </div>
                  
                  {user?.role === 'company' && selectedJob.postedBy === user.id && (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleEditClick}
                        className="text-linkedin-blue hover:bg-linkedin-background px-3 py-1.5 rounded-full transition-colors text-sm font-semibold border border-linkedin-border"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(selectedJob._id)}
                        className="text-red-600 hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-colors text-sm font-semibold border border-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mb-8">
                  <button 
                    onClick={triggerFileInput} 
                    disabled={user?.role === 'company'}
                    className={`px-8 py-2.5 rounded-full font-semibold transition-all text-base ${
                        user?.role === 'company' 
                        ? 'bg-linkedin-background text-linkedin-text-secondary cursor-not-allowed border border-linkedin-border' 
                        : 'bg-linkedin-blue hover:bg-opacity-90 text-white'
                    }`}
                  >
                    Apply Now
                  </button>
                  <button className="border border-linkedin-border text-linkedin-text-primary px-8 py-2.5 rounded-full font-semibold hover:bg-linkedin-background transition-colors">
                    Save
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 bg-linkedin-background p-6 rounded-lg border border-linkedin-border mb-8 text-sm">
                   <p><span className="text-linkedin-text-secondary font-semibold uppercase text-xs block mb-1">Category</span> <span className="text-linkedin-text-primary font-bold">{selectedJob.category}</span></p>
                   <p><span className="text-linkedin-text-secondary font-semibold uppercase text-xs block mb-1">Stipend / Salary</span> <span className="text-linkedin-text-primary font-bold">{selectedJob.stipend || 'Competitive'}</span></p>
                   <p><span className="text-linkedin-text-secondary font-semibold uppercase text-xs block mb-1">Duration</span> <span className="text-linkedin-text-primary font-bold">{selectedJob.duration || 'Full-time'}</span></p>
                   <p><span className="text-linkedin-text-secondary font-semibold uppercase text-xs block mb-1">Experience</span> <span className="text-linkedin-text-primary font-bold">{selectedJob.experience || 'Fresher'}</span></p>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-base font-bold text-linkedin-text-primary border-b border-linkedin-border pb-2 mb-4">Job Description</h3>
                    <p className="text-linkedin-text-primary text-sm leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                  </section>
                  {/* Additional sections like Responsibilities, Qualifications would go here */}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-linkedin-text-secondary italic">
                <div className="text-6xl mb-4 text-linkedin-blue opacity-30">💼</div>
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