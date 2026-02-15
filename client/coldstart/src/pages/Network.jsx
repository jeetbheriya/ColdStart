import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Navbar from './Navbar'; // Ensure Navbar is imported
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Network = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myNetwork, setMyNetwork] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchNetworkData = async () => {
    try {
      // Parallel requests for Phase 3 efficiency
      const [pendingRes, networkRes] = await Promise.all([
        axios.get("http://localhost:8080/api/connections/pending", config),
        axios.get("http://localhost:8080/api/connections/network", config)
      ]);
      setPendingRequests(pendingRes.data);
      setMyNetwork(networkRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchNetworkData(); }, []);

  const handleResponse = async (id, status) => {
    try {
      await axios.put(`http://localhost:8080/api/connections/respond/${id}`, { status }, config);
      fetchNetworkData(); // Refresh both lists for real-time feedback
    } catch (err) { alert("Action failed"); }
  };

  const handleMessageClick = (person) => {
    navigate("/chat", { state: { selectedUser: person } })
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-12 gap-8">
        
        {/* MAIN COLUMN */}
        <div className="col-span-12 md:col-span-8 space-y-10">
          
          {/* 1. TOP SECTION: PENDING INVITATIONS */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 italic">
              Invitations <span className="bg-indigo-600 text-xs px-2 py-1 rounded-full">{pendingRequests.length}</span>
            </h2>
            {pendingRequests.length > 0 ? (
              pendingRequests.map(req => (
                <div key={req._id} className="glass-card p-5 rounded-2xl flex items-center justify-between border border-indigo-500/30 hover:bg-slate-900/60 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full flex items-center justify-center font-bold text-white">
                      {req.sender?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold">{req.sender?.name}</h4>
                      <p className="text-xs text-slate-400">{req.sender?.headline}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleResponse(req._id, 'accepted')} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all">Accept</button>
                    <button onClick={() => handleResponse(req._id, 'rejected')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg font-bold transition-all">Ignore</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm italic p-4 glass-card rounded-xl">No pending requests at the moment.</p>
            )}
          </section>

          {/* 2. BOTTOM SECTION: ALL CONNECTIONS */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white italic">
              Your Network <span className="text-slate-500 font-normal">({myNetwork.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myNetwork.map(person => (
                <div key={person._id} className="glass-card p-5 rounded-2xl flex flex-col items-center text-center border border-slate-800 group hover:border-indigo-500/50 transition-all">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-2xl font-bold mb-3 group-hover:bg-indigo-600 transition-colors">
                    {person.name?.charAt(0)}
                  </div>
                  <h4 className="font-bold text-white">{person.name}</h4>
                  <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider mb-4 line-clamp-1">{person.headline}</p>
                  <button onClick={() => handleMessageClick(person)} className="w-full py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:border-indigo-600 transition-all">
                    Message
                  </button>
                </div>
              ))}
              {myNetwork.length === 0 && (
                <div className="col-span-2 text-center py-10 text-slate-500 glass-card rounded-2xl">
                  Start connecting with other engineers to grow your network!
                </div>
              )}
            </div>
          </section>
        </div>

        {/* SIDEBAR STATS */}
        <div className="hidden md:block col-span-4">
          <div className="glass-card p-6 rounded-3xl sticky top-24 border border-slate-800">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Network Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Connections</span>
                <span className="text-indigo-400 font-bold">{myNetwork.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Pending Requests</span>
                <span className="text-amber-500 font-bold">{pendingRequests.length}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Network;