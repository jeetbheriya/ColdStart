import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // Defaulting to 'user' as per your Model
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/register",
        formData
      );
      dispatch(setCredentials(res.data));
      alert("Signup Successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linkedin-background text-linkedin-text-primary">
      <div className="bg-linkedin-card p-8 rounded-lg shadow-xl w-full max-w-sm border border-linkedin-border">
        <h2 className="text-3xl font-bold mb-6 text-center text-linkedin-blue tracking-tighter italic">
          ColdStart
        </h2>
        
        {/* Role Selection Toggle */}
        <div className="flex bg-linkedin-background rounded-xl p-1 mb-6 border border-linkedin-border">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              formData.role === "user" ? "bg-linkedin-blue text-white shadow-lg" : "text-linkedin-text-secondary"
            }`}
            onClick={() => setFormData({ ...formData, role: "user" })}
          >
            INDIVIDUAL
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              formData.role === "company" ? "bg-linkedin-blue text-white shadow-lg" : "text-linkedin-text-secondary"
            }`}
            onClick={() => setFormData({ ...formData, role: "company" })}
          >
            COMPANY
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder={formData.role === "company" ? "Company Name" : "Full Name"}
            className="w-full p-3 rounded bg-linkedin-background border border-linkedin-border focus:border-linkedin-blue outline-none transition-colors text-linkedin-text-primary"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            required
            placeholder="Work or Personal Email"
            className="w-full p-3 rounded bg-linkedin-background border border-linkedin-border focus:border-linkedin-blue outline-none transition-colors text-linkedin-text-primary"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full p-3 rounded bg-linkedin-background border border-linkedin-border focus:border-linkedin-blue outline-none transition-colors text-linkedin-text-primary"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          
          <button className="w-full bg-linkedin-blue hover:bg-linkedin-blue/80 p-3 rounded-xl font-black shadow-lg shadow-linkedin-blue/20 transition-all hover:-translate-y-1 text-white">
            JOIN AS {formData.role.toUpperCase()}
          </button>
        </form>

        <p className="mt-6 text-center text-linkedin-text-secondary text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-linkedin-blue font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;