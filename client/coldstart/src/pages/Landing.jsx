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
    <div className="min-h-screen bg-linkedin-background font-system-ui">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Profile Summary */}
          <div className="md:col-span-1 lg:col-span-3">
            <div className="bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm p-6 text-center relative">
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-3 right-3 text-linkedin-blue hover:underline text-sm font-semibold"
              >
                Edit
              </button>

              <div className="relative inline-block">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-linkedin-border"
                  />
                ) : (
                  <div className="w-24 h-24 bg-linkedin-blue rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white border-2 border-linkedin-border">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-linkedin-card rounded-full"></div>
              </div>

              <h2 className="mt-4 text-xl font-bold text-linkedin-text-primary">
                {user?.name || "Guest User"}
              </h2>
              <p className="text-linkedin-text-secondary text-sm mb-4">
                {user?.headline || "Software Engineer"}
              </p>

              <div
                onClick={() => navigate("/network")}
                className="flex justify-between items-center py-3 border-t border-linkedin-border cursor-pointer hover:bg-linkedin-background px-2 rounded-md transition-colors"
              >
                <span className="text-linkedin-text-secondary text-xs uppercase">
                  Connections
                </span>
                <span className="text-linkedin-blue font-bold">
                  {networkCount}
                </span>
              </div>

              <hr className="my-4 border-linkedin-border" />

              <div className="text-left space-y-4">
                <div>
                  <label className="text-xs uppercase text-linkedin-text-secondary font-semibold">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user?.skills?.length > 0 ? (
                      user.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-linkedin-background text-linkedin-text-primary border border-linkedin-border px-2 py-1 rounded-md"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-linkedin-text-secondary italic">
                        No skills added
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase text-linkedin-text-secondary font-semibold">
                    About
                  </label>
                  <p className="text-xs text-linkedin-text-primary italic mt-2">
                    "{user?.about || "Tell us about your professional journey..."}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Main Feed */}
          <div className="md:col-span-2 lg:col-span-6 order-first md:order-none">
            <div className="bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-linkedin-text-primary">
                    Engineering Activity
                  </h3>
                  <p className="text-linkedin-text-secondary text-sm">
                    Stay updated with the ColdStart ecosystem.
                  </p>
                </div>
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="bg-linkedin-blue hover:bg-opacity-90 text-white px-5 py-2 rounded-full font-semibold transition-opacity"
                >
                  + New Post
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-20 text-linkedin-blue font-bold">
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
                <div className="text-center py-20 text-linkedin-text-secondary italic">
                  No posts found. Start the conversation!
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Daily Thought / Recommendations */}
          <div className="md:col-span-1 lg:col-span-3">
            <div className="bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-linkedin-text-primary mb-4">
                Today's Thought
              </h3>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 bg-linkedin-background rounded-full mb-3 flex items-center justify-center text-xl">
                  💡
                </div>
                <p className="text-linkedin-text-primary text-sm italic">
                  "{thought.content}"
                </p>
                <span className="text-xs text-linkedin-text-secondary mt-4">
                  — {thought.author}
                </span>
              </div>
            </div>

            {/* Placeholder for "Recommended for you" */}
            <div className="bg-linkedin-card border border-linkedin-border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-linkedin-text-primary mb-4">
                Recommended for you
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-linkedin-text-primary">
                      Company Name
                    </p>
                    <p className="text-sm text-linkedin-text-secondary">
                      Industry - Location
                    </p>
                    <button className="text-linkedin-blue text-sm mt-1 hover:underline">
                      + Follow
                    </button>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-linkedin-text-primary">
                      Another Person
                    </p>
                    <p className="text-sm text-linkedin-text-secondary">
                      Title at Company
                    </p>
                    <button className="text-linkedin-blue text-sm mt-1 hover:underline">
                      + Connect
                    </button>
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
