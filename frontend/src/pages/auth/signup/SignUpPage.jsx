import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
	username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 📌 Fetch User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude], // GeoJSON format
          });
        },
        (error) => {
          console.error("❌ Location Error:", error);
          toast.error("Location access is required for signup.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  }, []);

  // 📌 API Signup Mutation
  const { mutate, isPending, isError, error: apiError } = useMutation({
    mutationFn: async ({ email, fullName, username, password, location }) => {
      try {
        const res = await fetch("/api/auth/docSignup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullName, username, password, location }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create account");
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate('/login');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    if (!location) {
      setError("Location is required.");
      toast.error("Please enable location access to sign up.");
      return;
    }

    setError('');
    mutate({ ...formData, location });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-200 text-gray-900">
      <div className="max-w-md w-full mx-4">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center mb-8 hover:text-yellow-400 transition-all hover:transform hover:translate-x-[-4px] group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
          Back to Login
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8 group cursor-pointer">
            <Heart className="h-10 w-10 text-blue-800 transition-transform group-hover:scale-110" />
            <span className="ml-2 text-2xl font-bold text-blue-800 group-hover:text-teal-600 transition-colors">
              RecoveryPath
            </span>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8 text-blue-800 hover:text-teal-500 transition-colors">
            Sign Up
          </h2>

          {(error || isError) && <p className="text-red-600 text-center mb-4">{error || apiError?.message}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="group">
              <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-gray-900">Full Name</label>
              <div className="flex items-center bg-[#2A9D8F] rounded-lg p-2">
                <MdDriveFileRenameOutline className="text-white" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all hover:border-teal-500 bg-transparent text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="group">
              <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-900">Username</label>
              <div className="flex items-center bg-[#2A9D8F] rounded-lg p-2">
                <FaUser className="text-white" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all hover:border-teal-500 bg-transparent text-white"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-900">Email Address</label>
              <div className="flex items-center bg-[#2A9D8F] rounded-lg p-2">
                <MdOutlineMail className="text-white" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all hover:border-teal-500 bg-transparent text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-900">Password</label>
              <div className="flex items-center bg-[#2A9D8F] rounded-lg p-2">
                <MdPassword className="text-white" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all hover:border-teal-500 bg-transparent text-white"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-900">Confirm Password</label>
              <div className="flex items-center bg-[#2A9D8F] rounded-lg p-2">
                <MdPassword className="text-white" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all hover:border-teal-500 bg-transparent text-white"
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            </div>

            <button className="w-full py-3 rounded-lg font-semibold bg-blue-700 text-white hover:bg-blue-800 hover:scale-105 hover:shadow-lg transition-all">
              {isPending ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
