import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Navbar from './Navbar'; // Ensure Navbar is imported
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// Function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const newArray = [...array]; // Create a shallow copy to avoid modifying the original array
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Network = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myNetwork, setMyNetwork] = useState([]);
  const [recommended, setRecommended] = useState([]); // State for recommendations
  const { token, user: currentUser } = useSelector((state) => state.auth); // Destructure currentUser for filtering
  const navigate = useNavigate();

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchNetworkData = async () => {
    try {
      const [pendingRes, networkRes] = await Promise.all([
        axios.get("http://localhost:8080/api/connections/pending", config),
        axios.get("http://localhost:8080/api/connections/network", config)
      ]);
      setPendingRequests(pendingRes.data);
      setMyNetwork(networkRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchRecommended = async () => {
    try {
      const recRes = await axios.get("http://localhost:8080/api/users/recommended", config);
      // Filter out current user, shuffle, and take up to 5 unique recommendations
      const filteredRecommendations = recRes.data.filter(
        (item) => item._id !== currentUser._id && !myNetwork.some(connected => connected._id === item._id) // Filter out connected users
      );
      setRecommended(shuffleArray(filteredRecommendations).slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    }
  };

  useEffect(() => { 
    fetchNetworkData(); 
    if (currentUser) { // Only fetch recommended if currentUser is available
      fetchRecommended(); 
    }
  }, [currentUser, myNetwork]); // Re-fetch recommendations if currentUser or myNetwork changes

  const handleResponse = async (id, status) => {
    try {
      await axios.put(`http://localhost:8080/api/connections/respond/${id}`, { status }, config);
      fetchNetworkData(); // Refresh both lists for real-time feedback
      fetchRecommended(); // Also refresh recommendations
    } catch (err) { alert("Action failed"); }
  };

  const handleMessageClick = (person) => {
    navigate("/chat", { state: { selectedUser: person } })
  };

  const handleConnect = async (personId) => {
    try {
      await axios.post(`http://localhost:8080/api/connections/request/${personId}`, {}, config);
      alert("Connection request sent!");
      fetchRecommended(); // Refresh recommendations after sending a request
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request.");
    }
  };

  return (
    <div className="min-h-screen bg-linkedin-background text-linkedin-text-primary">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-4 grid grid-cols-12 gap-8 p-6 pt-14">
        
        {/* MAIN COLUMN */}
        <div className="col-span-12 md:col-span-8 space-y-10">
          
          {/* 1. TOP SECTION: PENDING INVITATIONS */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-linkedin-text-primary flex items-center gap-2 italic">
              Invitations <span className="bg-indigo-600 text-xs px-2 py-1 rounded-full">{pendingRequests.length}</span>
            </h2>
            {pendingRequests.length > 0 ? (
              pendingRequests.map(req => (
                <div key={req._id} className="glass-card p-5 rounded-2xl flex items-center justify-between border border-linkedin-border hover:bg-linkedin-border transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linkedin-blue rounded-full flex items-center justify-center font-bold text-white">
                      {req.sender?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-linkedin-text-primary">{req.sender?.name}</h4>
                      <p className="text-xs text-linkedin-text-secondary">{req.sender?.headline}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleResponse(req._id, 'accepted')} className="bg-linkedin-blue hover:bg-linkedin-blue/80 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all">Accept</button>
                    <button onClick={() => handleResponse(req._id, 'rejected')} className="bg-linkedin-border hover:bg-linkedin-text-secondary/20 text-linkedin-text-secondary text-xs px-4 py-2 rounded-lg font-bold transition-all">Ignore</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-linkedin-text-secondary text-sm italic p-4 glass-card rounded-xl">No pending requests at the moment.</p>
            )}
          </section>

          {/* 2. BOTTOM SECTION: ALL CONNECTIONS */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-linkedin-text-primary italic">
              Your Network <span className="text-linkedin-text-secondary font-normal">({myNetwork.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myNetwork.map(person => (
                <div key={person._id} className="glass-card p-5 rounded-2xl flex flex-col items-center text-center border border-linkedin-border group hover:border-linkedin-blue/50 transition-all">
                  <div className="w-16 h-16 bg-linkedin-border rounded-full flex items-center justify-center text-2xl font-bold mb-3 group-hover:bg-linkedin-blue transition-colors text-linkedin-text-primary">
                    {person.name?.charAt(0)}
                  </div>
                  <h4 className="font-bold text-linkedin-text-primary">{person.name}</h4>
                  <p className="text-[10px] text-linkedin-blue uppercase font-bold tracking-wider mb-4 line-clamp-1">{person.headline}</p>
                  <button onClick={() => handleMessageClick(person)} className="w-full py-2 bg-linkedin-card border border-linkedin-border text-linkedin-blue hover:bg-linkedin-blue hover:border-linkedin-blue hover:text-white transition-all">
                    Message
                  </button>
                </div>
              ))}
              {myNetwork.length === 0 && (
                <div className="col-span-2 text-center py-10 text-linkedin-text-secondary glass-card rounded-2xl">
                  Start connecting with other engineers to grow your network!
                </div>
              )}
            </div>
          </section>
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="hidden md:block col-span-4 space-y-8 sticky top-24">
          {/* NEW: Profile Card */}
          <div className="glass-card p-6 rounded-3xl border border-linkedin-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-linkedin-blue text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="font-bold text-lg text-linkedin-text-primary">{currentUser?.name}</h3>
                <p className="text-sm text-linkedin-text-secondary line-clamp-1">{currentUser?.headline || "No headline set"}</p>
              </div>
            </div>
            <Link to="/profile" className="w-full bg-linkedin-blue hover:bg-linkedin-blue/80 text-white text-sm px-4 py-2 rounded-lg font-bold block text-center">View Profile</Link>
          </div>

          {/* NEW: Today's Thought */}
          <div className="glass-card p-6 rounded-3xl border border-linkedin-border">
            <h3 className="text-[10px] font-black uppercase text-linkedin-text-secondary tracking-[0.2em] mb-4">Today's Thought</h3>
            <p className="text-sm text-linkedin-text-primary italic">"The only way to do great work is to love what you do."</p>
            <p className="text-xs text-linkedin-text-secondary mt-2">- Steve Jobs</p>
          </div>

          {/* NEW: Engineering Activity */}
          <div className="glass-card p-6 rounded-3xl border border-linkedin-border">
            <h3 className="text-[10px] font-black uppercase text-linkedin-text-secondary tracking-[0.2em] mb-4">Engineering Activity</h3>
            <div className="space-y-2 text-sm text-linkedin-text-primary">
                <p>— Contributed to Frontend Monorepo</p>
                <p>— Reviewed 3 Pull Requests</p>
                <p>— Attended Daily Standup</p>
            </div>
          </div>

          {/* SIDEBAR STATS */}
          <div className="glass-card p-6 rounded-3xl border border-linkedin-border">
            <h3 className="text-[10px] font-black uppercase text-linkedin-text-secondary tracking-[0.2em] mb-4">Network Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-linkedin-text-secondary">Total Connections</span>
                <span className="text-linkedin-blue font-bold">{myNetwork.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-linkedin-text-secondary">Pending Requests</span>
                <span className="text-amber-500 font-bold">{pendingRequests.length}</span>
              </div>
            </div>
          </div>

          {/* NEW: Recommended for you */}
          <div className="glass-card p-6 rounded-3xl border border-linkedin-border">
            <h3 className="text-[10px] font-black uppercase text-linkedin-text-secondary tracking-[0.2em] mb-4">Recommended for you</h3>
            <div className="space-y-4">
              {recommended.length > 0 ? (
                recommended.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linkedin-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-linkedin-text-primary">{item.name}</h4>
                      <p className="text-xs text-linkedin-text-secondary line-clamp-1">{item.headline || item.description?.substring(0, 50) + '...'}</p>
                    </div>
                    <button onClick={() => handleConnect(item._id)} className="ml-auto bg-linkedin-blue hover:bg-linkedin-blue/80 text-white text-xs px-3 py-1 rounded-full font-bold">Connect</button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-linkedin-text-secondary">No recommendations available.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Network;