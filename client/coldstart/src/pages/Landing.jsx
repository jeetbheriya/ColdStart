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

  /* ===============================
     FETCH POSTS + NETWORK DATA
  =============================== */
  const fetchData = async () => {
    try {
      setLoading(true);

      // ✅ Guest user → DO NOT call protected APIs
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

      const [postsRes, networkRes] = await Promise.all([
        axios.get("http://localhost:8080/api/posts", config),
        axios.get("http://localhost:8080/api/connections/network", config),
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
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-[1400px]">
        <Navbar />

        <div className="grid grid-cols-12 gap-6 h-[82vh]">
          {/* LEFT PROFILE */}
          <div className="col-span-3 flex flex-col gap-6">
            <div className="glass-card rounded-3xl p-8 text-center relative">
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-4 right-4 text-slate-500 hover:text-indigo-400 text-sm font-bold"
              >
                Edit
              </button>

              <div className="relative inline-block">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full mx-auto border-4 border-slate-900 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full mx-auto border-4 border-slate-900 flex items-center justify-center text-3xl font-bold text-white">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-slate-950 rounded-full"></div>
              </div>

              <h2 className="mt-4 text-xl font-bold">
                {user?.name || "Guest User"}
              </h2>
              <p className="text-indigo-400 text-sm mb-4">
                {user?.headline || "Software Engineer"}
              </p>

              <div
                onClick={() => navigate("/network")}
                className="flex justify-between items-center py-3 border-t border-slate-800 cursor-pointer hover:bg-slate-900/40 px-2 rounded-xl"
              >
                <span className="text-slate-400 text-xs uppercase">
                  Connections
                </span>
                <span className="text-indigo-400 font-bold">
                  {networkCount}
                </span>
              </div>

              <hr className="my-4 border-slate-800" />

              <div className="text-left space-y-4">
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.length > 0 ? (
                    user.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded-md"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-600 italic">
                      No skills added
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase text-slate-500">
                    About
                  </label>
                  <p className="text-xs text-slate-400 italic">
                    "{user?.about || "Tell us about your professional journey..."}"
                  </p>
                </div>
              </div>
            </div>

            {/* DAILY THOUGHT */}
            <div className="glass-card rounded-3xl p-6 flex-grow flex flex-col">
              <h3 className="text-xs uppercase text-slate-500 mb-4">
                Today's Thought
              </h3>
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-xl mb-3 flex items-center justify-center text-xl">
                  💡
                </div>
                <p className="text-slate-300 text-sm italic">
                  "{thought.content}"
                </p>
                <span className="text-xs text-indigo-400 mt-4">
                  — {thought.author}
                </span>
              </div>
            </div>
          </div>

          {/* MAIN FEED */}
          <div className="col-span-9 glass-card rounded-3xl overflow-y-auto custom-scrollbar p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-bold">
                  Engineering Activity
                </h3>
                <p className="text-slate-500 text-sm">
                  Stay updated with the ColdStart ecosystem.
                </p>
              </div>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold"
              >
                + New Post
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 text-indigo-500 font-bold">
                Loading feed...
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
              <div className="text-center py-20 text-slate-500 italic">
                No posts found. Start the conversation!
              </div>
            )}
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
