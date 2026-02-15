import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../redux/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${API_URL}/api/auth/login`, formData);
        dispatch(setCredentials(res.data));
        alert("Logged in succesfully !");
        navigate("/");
    } catch (error) {
        console.log(error);
        alert(error.response?.data?.message || "Login Failed: Check your credentials !");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linkedin-background text-linkedin-text-primary">
      <div className="bg-linkedin-card p-8 rounded-lg shadow-xl w-full max-w-sm border border-linkedin-border">
        <h2 className="text-3xl font-bold mb-6 text-center text-linkedin-blue">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email" 
            className="w-full p-3 rounded bg-linkedin-background border border-linkedin-border focus:border-linkedin-blue outline-none text-linkedin-text-primary"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-3 rounded bg-linkedin-background border border-linkedin-border focus:border-linkedin-blue outline-none text-linkedin-text-primary"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button className="w-full bg-linkedin-blue hover:bg-linkedin-blue/80 p-3 rounded font-bold transition text-white">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-linkedin-text-secondary">
          Don't have an account? <Link to="/signup" className="text-linkedin-blue">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;