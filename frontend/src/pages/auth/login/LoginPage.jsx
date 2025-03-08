import React, { useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

const LoginPage = () => {

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", 
        });
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [role, setRole] = useState('doctor'); // Toggle between doctor and patient
  const [isSwitched, setIsSwitched] = useState(false); // Track switch animation
  const [formData, setFormData] = useState({ username: "", password: "" });

  // API Login Mutation
  const { mutate: loginMutation, isPending, isError, error } = useMutation({
    mutationFn: async ({ username, password, role }) => {
      try {
        const endpoint = role === "doctor" ? "/api/auth/docLogin" : "/api/auth/patientLogin"; // Dynamic path
        const res = await fetch(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include", // ✅ Sends cookies
			body: JSON.stringify({ username, password }),
		});
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");

        // Navigate based on user role
        if (data.role === "Doctor") {
          navigate('/doctorDashboard');
        } else if (data.role === "Patient") {
          navigate('/patientDashboard');
        } else {
          throw new Error("Invalid role detected");
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleRoleSwitch = (newRole) => {
    if (role !== newRole) {
      setIsSwitched(true);
      setTimeout(() => {
        setRole(newRole);
        setIsSwitched(false);
      }, 300);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation({ ...formData, role });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 
      ${role === 'doctor' ? 'bg-blue-200 text-gray-900' : 'bg-gradient-to-br from-teal-600 to-teal-900 text-gray-100'}`}>
      
      <div className="max-w-md w-full mx-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center mb-8 hover:text-yellow-400 transition-all hover:transform hover:translate-x-[-4px] group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
          Back to Home
        </button>

        {/* Card Container */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 transition-transform duration-300 
          ${isSwitched ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}`}>
          
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-8 group cursor-pointer">
            <Heart className={`h-10 w-10 transition-transform group-hover:scale-110 
              ${role === 'doctor' ? 'text-blue-800' : 'text-teal-400'}`} />
            <span className={`ml-2 text-2xl font-bold group-hover:text-teal-600 transition-colors 
              ${role === 'doctor' ? 'text-blue-800' : 'text-teal-400'}`}>
              RecoveryPath
            </span>
          </div>

          <h2 className={`text-3xl font-bold text-center mb-8 hover:text-teal-500 transition-colors 
            ${role === 'doctor' ? 'text-blue-800' : 'text-teal-300'}`}>
            {role === 'doctor' ? 'Doctor Login' : 'Patient Login'}
          </h2>

          {/* Role Switcher */}
          <div className="flex justify-center mb-6">
            <button 
              className={`px-4 py-2 rounded-l-lg font-semibold transition-all 
                ${role === 'doctor' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-800'}`} 
              onClick={() => handleRoleSwitch('doctor')}
            >
              Doctor
            </button>
            <button 
              className={`px-4 py-2 rounded-r-lg font-semibold transition-all 
                ${role === 'patient' ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-800'}`} 
              onClick={() => handleRoleSwitch('patient')}
            >
              Patient
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label htmlFor="username" className={`block text-sm font-medium mb-2 
                group-hover:text-teal-600 transition-colors 
                ${role === 'doctor' ? 'text-gray-900' : 'text-gray-300'}`}>
                Username
              </label>
              <div className={`flex items-center ${role === 'doctor' ? 'bg-blue-700' : 'bg-[#2A9D8F]'} rounded-lg p-2`}>
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

            <div className="group">
              <label htmlFor="password" className={`block text-sm font-medium mb-2 
                group-hover:text-teal-600 transition-colors 
                ${role === 'doctor' ? 'text-gray-900' : 'text-gray-300'}`}>
                Password
              </label>
              <div className={`flex items-center ${role === 'doctor' ? 'bg-blue-700' : 'bg-[#2A9D8F]'} rounded-lg p-2`}>
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

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold transition-all hover:transform hover:scale-105 hover:shadow-lg 
                ${role === 'doctor' ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
            >
              {isPending ? "Loading..." : "Sign In"}
            </button>

            {isError && <p className="text-red-500 text-center">{error.message}</p>}
          </form>

          {/* Signup Link */}
          <p className="mt-6 text-center text-sm">
            Need an account?{' '}
            <button onClick={() => navigate('/signup')} className={`font-semibold transition-all hover:transform hover:translate-y-[-2px] 
              ${role === 'doctor' ? 'text-blue-800 hover:text-blue-600' : 'text-teal-400 hover:text-teal-300'}`}>
              Sign Up Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
