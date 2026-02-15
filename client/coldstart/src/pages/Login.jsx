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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post("http://localhost:8080/api/auth/login", formData);
        dispatch(setCredentials(res.data));
        alert("Logged in succesfully !");
        navigate("/");
    } catch (error) {
        console.log(error);
        alert(error.response?.data?.message || "Login Failed: Check your credentials !");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email" 
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Don't have an account? <Link to="/signup" className="text-blue-500">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;