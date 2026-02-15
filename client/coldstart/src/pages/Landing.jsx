import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import EditProfileModal from "../components/EditProfileModal";
import PostModal from "../components/PostModal";
import PostCard from "../components/PostCard";

const Landing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [networkCount, setNetworkCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [thought, setThought] = useState({
    content: "Loading some fun...",
    author: "Software Engineer",
  });

  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ✅ DYNAMIC API URL: Essential for Render/Netlify communication
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  /* ===============================
      FETCH POSTS + NETWORK DATA
  =============================== */
  const fetchData = async () => {
    try {
      setLoading(true);

      // ✅ Guest protection
      if (!token) {
        setPosts([]);
        setNetworkCount(0);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // ✅ Updated to use dynamic API_URL instead of hardcoded localhost
      const [postsRes, networkRes] = await Promise.all([
        axios.get(`${API_URL}/api/posts`, config),
        axios.get(`${API_URL}/api/connections/network`, config),
      ]);

      setPosts(postsRes.data || []);
      setNetworkCount(networkRes.data?.length || 0);
    } catch (error) {
      console.error("Error fetching landing data:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
      FETCH DAILY THOUGHT
  =============================== */
  const fetchThought = async () => {
    try {
      const res = await axios.get("https://api.adviceslip.com/advice");
      setThought({
        content: res.data.slip.advice,
        author: user?.name || "Advice for Coder",
      });
    } catch {
      setThought({
        content: "Clean code is its own reward.",
        author: user?.name || "Software Engineer",
      });
    }
  };

  /* ===============================
      EFFECT
  =============================== */
  useEffect(() => {
    fetchData();
    fetchThought();
  }, [token, API_URL]);

  return (
    <div className="min-h-screen bg-[#F3F2EF] font-sans text-[#1d1d1d]">
      <Navbar />
      <div className="container mx-auto p-2 md:p-4 lg:p-8">
        {/* Responsive Grid System: Stacks on mobile, 12-cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Profile Summary - Hidden on mobile to save space */}
          <div className="hidden md:block md:col-span-1 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-0 text-center relative overflow-hidden">
              {/* LinkedIn Blue Header Background */}
              <div className="h-14 bg-[#0A66C2] w-full"></div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-16 right-3 text-[#0A66C2] hover:underline text-xs font-bold"
              >
                Edit
              </button>

              <div className="relative inline-block -mt-10">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 bg-[#0A66C2] rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white border-4 border-white shadow-sm uppercase">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              <div className="p-4 pt-2">
                <h2 className="text-lg font-bold">
                  {user?.name || "Guest User"}
                </h2>
                <p className="text-slate-500 text-xs mb-4">
                  {user?.headline || "Software Engineer"}
                </p>

                <div
                  onClick={() => navigate("/network")}
                  className="flex justify-between items-center py-3 border-t border-slate-100 cursor-pointer hover:bg-slate-50 px-2 rounded-md transition-colors"
                >
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    Connections
                  </span>
                  <span className="text-[#0A66C2] font-bold">
                    {networkCount}
                  </span>
                </div>

                <div className="text-left mt-4 pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-bold tracking-tighter">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user?.skills?.length > 0 ? (
                        user.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No skills added</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Main Feed */}
          <div className="col-span-1 md:col-span-3 lg:col-span-6 order-first md:order-none">
            {/* "Start a Post" box mirroring LinkedIn */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[#0A66C2]">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="flex-grow text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-slate-500 font-medium transition-colors text-sm"
                >
                  Start a post...
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10">
                   <div className="animate-spin inline-block w-8 h-8 border-4 border-[#0A66C2] border-t-transparent rounded-full mb-2"></div>
                   <p className="text-slate-500 font-bold text-sm">Synchronizing your feed...</p>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    refreshPosts={fetchData}
                  />
                ))
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                  <div className="text-5xl mb-4 opacity-30">🚀</div>
                  <h4 className="font-bold text-lg">Your feed is empty!</h4>
                  <p className="text-slate-500 text-sm mt-2">Since this is a fresh database on Render, start by creating a new post to see it here.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Daily Thought */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-4">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                Today's Thought <span className="text-lg">💡</span>
              </h3>
              <div className="flex flex-col">
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "{thought.content}"
                </p>
                <span className="text-[10px] font-bold text-[#0A66C2] mt-4 uppercase tracking-tighter">
                  — Shared by {thought.author}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Recommended for you
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[#0A66C2]">C</div>
                  <div>
                    <p className="font-bold text-xs">ColdStart AI</p>
                    <p className="text-[10px] text-slate-500">Tech • Bengaluru</p>
                    <button className="text-[#0A66C2] text-[11px] font-bold mt-1 hover:underline">+ Follow</button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        refreshPosts={fetchData}
      />
    </div>
  );
};

export default Landing;