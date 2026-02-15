import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";

const Applicants = () => {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  // State to toggle visibility of private contact info
  const [showContact, setShowContact] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8080/api/applications/company", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApps(res.data);
        if (res.data.length > 0) setSelectedApp(res.data[0]);
      } catch (err) {
        console.error("Error fetching applicants", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [token]);

  // Reset the contact reveal whenever a different applicant is selected
  useEffect(() => {
    setShowContact(false);
  }, [selectedApp]);

  return (
    <div className="min-h-screen bg-linkedin-background font-system-ui">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-8">
        
        <div className="text-left mb-6 bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm p-4">
          <h1 className="text-xl font-bold text-linkedin-text-primary">Talent Pipeline</h1>
          <p className="text-linkedin-text-secondary text-sm">Review candidates and their professional contact details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: Applicant List */}
          <div className="md:col-span-4 lg:col-span-3 bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm overflow-hidden h-[calc(100vh-200px)]">
            <div className="h-full overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-4 text-center animate-pulse text-linkedin-blue font-bold">Scanning database...</div>
              ) : apps.length > 0 ? (
                apps.map(app => (
                  <div 
                    key={app._id} 
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 border-b border-linkedin-border text-left cursor-pointer hover:bg-linkedin-background transition-all ${selectedApp?._id === app._id ? 'bg-linkedin-background border-r-4 border-r-linkedin-blue' : ''}`}
                  >
                    <h3 className="font-bold text-linkedin-text-primary">{app.applicant.name}</h3>
                    <p className="text-sm text-linkedin-blue mt-1">{app.job.title}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-linkedin-text-secondary">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">New</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-linkedin-text-secondary italic">No applications received yet.</div>
              )}
            </div>
          </div>

          {/* RIGHT: Detailed Profile & Resume View */}
          <div className="md:col-span-8 lg:col-span-9 bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm p-6 overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
            {selectedApp ? (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-linkedin-blue rounded-full flex items-center justify-center text-2xl font-bold text-white">
                      {selectedApp.applicant.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-linkedin-text-primary">{selectedApp.applicant.name}</h1>
                      <p className="text-linkedin-text-secondary text-base">{selectedApp.applicant.headline}</p>
                      
                      {/* Revealed Contact Information */}
                      {showContact ? (
                        <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-green-600 text-sm font-semibold">📧 {selectedApp.applicant.email}</p>
                          <p className="text-green-600 text-sm font-semibold">📞 {selectedApp.applicant.phoneNumber || "Not Provided"}</p>
                        </div>
                      ) : (
                        <p className="text-linkedin-text-secondary text-xs italic mt-2">Contact hidden. Click 'Reveal' to view details.</p>
                      )}
                    </div>
                  </div>

                  {/* Toggle button to show contact info */}
                  <button 
                    onClick={() => setShowContact(!showContact)}
                    className={`px-5 py-2 rounded-full font-semibold transition-colors text-sm ${showContact ? 'bg-linkedin-background text-linkedin-blue border border-linkedin-blue' : 'bg-linkedin-blue text-white hover:bg-opacity-90'}`}
                  >
                    {showContact ? "Hide Contact" : "Reveal Contact"}
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Technical Toolkit Section */}
                  <section>
                    <h3 className="text-sm font-bold text-linkedin-text-primary border-b border-linkedin-border pb-2 mb-4">Candidate Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.applicant.skills?.map(skill => (
                        <span key={skill} className="bg-linkedin-background text-linkedin-text-primary px-3 py-1.5 rounded-full text-xs font-medium border border-linkedin-border">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Resume Viewer Section */}
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-sm font-bold text-linkedin-text-primary border-b border-linkedin-border pb-2">Resume Preview</h3>
                      <a 
                        href={`http://localhost:8080/${selectedApp.resume.replace(/\\/g, "/")}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-linkedin-blue text-sm hover:underline"
                      >
                        Open Full PDF ↗
                      </a>
                    </div>
                    <div className="w-full h-[650px] bg-linkedin-background rounded-lg overflow-hidden border border-linkedin-border shadow-md">
                      {/* Fixed path format for cross-platform compatibility */}
                      <iframe 
                        src={`http://localhost:8080/${selectedApp.resume.replace(/\\/g, "/")}#toolbar=0&navpanes=0`} 
                        className="w-full h-full border-none"
                        title="Candidate Resume"
                      />
                    </div>
                  </section>

                  <section className="pt-8 border-t border-linkedin-border">
                    <h4 className="text-sm font-bold text-linkedin-text-primary mb-3">Professional Background</h4>
                    <p className="text-linkedin-text-secondary text-sm leading-relaxed whitespace-pre-line">
                      {selectedApp.applicant.about || "This candidate has not provided an extended bio."}
                    </p>
                  </section>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-linkedin-text-secondary italic">
                <div className="text-6xl mb-6 text-linkedin-blue opacity-30">🧑‍💻</div>
                Select a candidate to review their application details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applicants;