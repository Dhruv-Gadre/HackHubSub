import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Users, Activity } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen transition-colors duration-300 bg-blue-200 text-gray-900">
      <nav className="bg-transparent py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center group cursor-pointer">
            <Heart className="h-8 w-8 text-blue-800 transform group-hover:scale-110 transition-transform" />
            <span className="ml-2 text-2xl font-bold text-blue-800 group-hover:text-blue-600 transition-colors">RecoveryPath</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-900 hover:text-blue-600 transition-all hover:transform hover:translate-y-[-2px]">Journey</button>
            <button className="text-gray-900 hover:text-blue-600 transition-all hover:transform hover:translate-y-[-2px]">Support</button>
            <button className="text-gray-900 hover:text-blue-600 transition-all hover:transform hover:translate-y-[-2px]">Community</button>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-700 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-800 transition-all hover:transform hover:scale-105 hover:shadow-lg"
            >
              Log In
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-blue-800 mb-6 transition-all hover:transform hover:translate-x-2">
              Professional Portal for
              <span className="block text-blue-600 mt-2 hover:text-blue-500 transition-colors">Recovery Management</span>
            </h1>
            <p className="text-gray-700 text-lg mb-8 hover:text-gray-900 transition-colors">
              A comprehensive platform for healthcare professionals and mentors to monitor, 
              support, and guide patients through their recovery journey. Track progress, 
              access resources, and provide personalized care all in one place.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-blue-800 hover:transform hover:scale-105 hover:shadow-lg"
              >
                Access Portal
              </button>
              <button className="border-2 border-blue-800 text-blue-800 px-8 py-3 rounded-full font-semibold transition-all hover:bg-blue-800 hover:text-white hover:transform hover:scale-105 hover:shadow-lg">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl transition-all hover:transform hover:scale-105 hover:bg-white/20 group cursor-pointer">
              <Shield className="h-10 w-10 text-blue-600 mb-4 transition-transform group-hover:scale-110" />
              <h3 className="text-xl font-semibold text-blue-800 mb-2 group-hover:text-blue-600 transition-colors">Secure Monitoring</h3>
              <p className="text-gray-700 group-hover:text-gray-900 transition-colors">
                Track patient progress and recovery milestones securely and confidentially.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl transition-all hover:transform hover:scale-105 hover:bg-white/20 group cursor-pointer">
              <Activity className="h-10 w-10 text-blue-600 mb-4 transition-transform group-hover:scale-110" />
              <h3 className="text-xl font-semibold text-blue-800 mb-2 group-hover:text-blue-600 transition-colors">Real-time Updates</h3>
              <p className="text-gray-700 group-hover:text-gray-900 transition-colors">
                Get instant notifications and updates about patient activities and progress.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl transition-all hover:transform hover:scale-105 hover:bg-white/20 group cursor-pointer">
              <Users className="h-10 w-10 text-blue-600 mb-4 transition-transform group-hover:scale-110" />
              <h3 className="text-xl font-semibold text-blue-800 mb-2 group-hover:text-blue-600 transition-colors">Team Collaboration</h3>
              <p className="text-gray-700 group-hover:text-gray-900 transition-colors">
                Coordinate with other healthcare providers for comprehensive care.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl transition-all hover:transform hover:scale-105 hover:bg-white/20 group cursor-pointer">
              <Heart className="h-10 w-10 text-blue-600 mb-4 transition-transform group-hover:scale-110" />
              <h3 className="text-xl font-semibold text-blue-800 mb-2 group-hover:text-blue-600 transition-colors">Patient Support</h3>
              <p className="text-gray-700 group-hover:text-gray-900 transition-colors">
                Provide personalized guidance and support throughout the recovery journey.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
