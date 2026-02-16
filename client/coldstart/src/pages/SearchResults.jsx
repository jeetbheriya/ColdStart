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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/users/search/${query}`, {
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
      await axios.post(`${API_URL}/api/connections/request/${receiverId}`, {}, config);
      alert("Professional connection request sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Request already pending");
    }
  };

  return (
    <div className="min-h-screen bg-linkedin-background text-linkedin-text-primary p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6 italic text-linkedin-text-primary">Results for "{query}"</h2>
        
        <div className="grid gap-4">
          {results.map(person => (
            // Prevent showing yourself in search results 
            person._id !== currentUser?._id && (
              <div key={person._id} className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:justify-between border border-linkedin-border hover:border-linkedin-blue/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-linkedin-blue rounded-full flex items-center justify-center font-bold text-xl shadow-lg text-white">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-linkedin-text-primary">{person.name}</h4>
                    <p className="text-xs text-linkedin-blue font-medium">{person.headline}</p>
                    <div className="flex gap-2 mt-2">
                      {person.skills?.slice(0, 3).map((skill, index) => (
                        <span key={index} className="text-[10px] bg-linkedin-background text-linkedin-text-secondary px-2 py-0.5 rounded border border-linkedin-border">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* The Connect Trigger  */}
                <button 
                  onClick={() => handleConnect(person._id)}
                  className="w-full sm:w-auto mt-3 sm:mt-0 bg-linkedin-blue hover:bg-linkedin-blue/80 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-linkedin-blue/20 transition-all active:scale-95"
                >
                  Connect
                </button>
              </div>
            )
          ))}
          
          {loading && <p className="text-center text-linkedin-blue animate-pulse">Searching the ColdStart network...</p>}
          {!loading && results.length === 0 && (
            <div className="text-center p-10 glass-card rounded-3xl">
              <p className="text-linkedin-text-secondary">No engineers found with that name or skill.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;