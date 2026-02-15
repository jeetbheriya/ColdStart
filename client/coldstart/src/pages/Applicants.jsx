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
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-[1400px]">
        <Navbar />
        
        <div className="text-left mb-6 px-2">
          <h1 className="text-2xl font-bold text-white tracking-tight italic uppercase italic">TALENT PIPELINE</h1>
          <p className="text-slate-500 text-sm">Review candidates and their professional contact details.</p>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[82vh]">
          {/* LEFT: Applicant List */}
          <div className="col-span-4 glass-card rounded-3xl overflow-y-auto border border-slate-800 custom-scrollbar bg-slate-900/20">
            {loading ? (
              <div className="p-10 text-center animate-pulse text-indigo-500 font-black italic">SCANNING DATABASE...</div>
            ) : apps.length > 0 ? (
              apps.map(app => (
                <div 
                  key={app._id} 
                  onClick={() => setSelectedApp(app)}
                  className={`p-5 border-b border-slate-800 text-left cursor-pointer hover:bg-slate-900/50 transition-all ${selectedApp?._id === app._id ? 'bg-indigo-500/10 border-r-4 border-indigo-500' : ''}`}
                >
                  <h3 className="font-bold text-white uppercase tracking-tighter">{app.applicant.name}</h3>
                  <p className="text-xs text-indigo-400 font-black mt-1 italic">{app.job.title}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-bold uppercase">New</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-600 italic">No applications received yet.</div>
            )}
          </div>

          {/* RIGHT: Detailed Profile & Resume View */}
          <div className="col-span-8 glass-card rounded-3xl p-10 overflow-y-auto border border-slate-800 text-left custom-scrollbar bg-slate-900/20">
            {selectedApp ? (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-500/20 transform -rotate-3">
                      {selectedApp.applicant.name[0]}
                    </div>
                    <div>
                      <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">{selectedApp.applicant.name}</h1>
                      <p className="text-indigo-400 font-bold text-lg">{selectedApp.applicant.headline}</p>
                      
                      {/* Revealed Contact Information */}
                      {showContact ? (
                        <div className="mt-3 space-y-1 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-green-400 text-sm font-bold tracking-widest uppercase">📧 {selectedApp.applicant.email}</p>
                          <p className="text-green-400 text-sm font-bold tracking-widest uppercase">📞 {selectedApp.applicant.phoneNumber || "Not Provided"}</p>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs font-mono mt-2 italic">Contact hidden. Click 'Reveal' to view details.</p>
                      )}
                    </div>
                  </div>

                  {/* Toggle button to show contact info */}
                  <button 
                    onClick={() => setShowContact(!showContact)}
                    className={`border ${showContact ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'} px-8 py-2.5 rounded-xl font-black transition-all text-xs tracking-widest uppercase shadow-lg`}
                  >
                    {showContact ? "Hide Contact" : "Reveal Contact 💬"}
                  </button>
                </div>

                <div className="space-y-12">
                  {/* Technical Toolkit Section */}
                  <section>
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] border-b border-slate-800 pb-2 mb-4">CANDIDATE TOOLKIT</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.applicant.skills?.map(skill => (
                        <span key={skill} className="bg-slate-900 px-4 py-1.5 rounded-lg text-[10px] font-black text-indigo-300 border border-slate-800 uppercase tracking-widest">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Resume Viewer Section */}
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] border-b border-indigo-500/30 pb-2">Compulsory Resume Preview</h3>
                      <a 
                        href={`http://localhost:8080/${selectedApp.resume.replace(/\\/g, "/")}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-slate-500 hover:text-white underline uppercase tracking-widest"
                      >
                        Open Full PDF ↗
                      </a>
                    </div>
                    <div className="w-full h-[650px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                      {/* Fixed path format for cross-platform compatibility */}
                      <iframe 
                        src={`http://localhost:8080/${selectedApp.resume.replace(/\\/g, "/")}#toolbar=0&navpanes=0`} 
                        className="w-full h-full border-none"
                        title="Candidate Resume"
                      />
                    </div>
                  </section>

                  <section className="pt-10 border-t border-slate-800">
                    <h4 className="text-xs font-black text-slate-500 mb-3 uppercase tracking-widest italic">Professional Background</h4>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-3xl whitespace-pre-line">
                      {selectedApp.applicant.about || "This candidate has not provided an extended bio."}
                    </p>
                  </section>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 italic">
                <div className="text-8xl mb-6 grayscale opacity-10 font-black tracking-tighter italic">COLDSTART</div>
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