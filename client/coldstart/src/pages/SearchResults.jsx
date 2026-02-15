import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  
  // Use Redux token for consistency with your Auth state
  const { token, user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8080/api/users/search/${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    };
    if (query) fetchResults();
  }, [query, token]);

  // Handle sending connection requests 
  const handleConnect = async (receiverId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`http://localhost:8080/api/connections/request/${receiverId}`, {}, config);
      alert("Professional connection request sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Request already pending");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6 italic">Results for "{query}"</h2>
        
        <div className="grid gap-4">
          {results.map(person => (
            // Prevent showing yourself in search results 
            person._id !== currentUser?._id && (
              <div key={person._id} className="glass-card p-5 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-indigo-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{person.name}</h4>
                    <p className="text-xs text-indigo-400 font-medium">{person.headline}</p>
                    <div className="flex gap-2 mt-2">
                      {person.skills?.slice(0, 3).map((skill, index) => (
                        <span key={index} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* The Connect Trigger  */}
                <button 
                  onClick={() => handleConnect(person._id)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  Connect
                </button>
              </div>
            )
          ))}
          
          {loading && <p className="text-center text-indigo-400 animate-pulse">Searching the ColdStart network...</p>}
          {!loading && results.length === 0 && (
            <div className="text-center p-10 glass-card rounded-3xl">
              <p className="text-slate-500">No engineers found with that name or skill.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;