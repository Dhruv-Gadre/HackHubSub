import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProfilesPage from "./pages/Supporters/supporters";
import DashboardPage from "./pages/doctor/DashboardPage";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import LandingPage from "./pages/home/LandingPage";

function App() {
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

	// Show loading spinner until auth status is fetched
	if (isLoading) {
		return (
			<div className="h-screen flex justify-center items-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	// Redirect based on role
	const isDoctor = authUser?.role === "Doctor";
	const isPatient = authUser?.role === "Patient";

	return (
		<div className="flex w-full">
			{/* Sidebar & RightPanel shown ONLY for patients */}
			{isPatient && <Sidebar />}

			{/* Ensure full width when Sidebar is hidden */}
			<div className={`w-full ${isPatient ? "ml-[250px]" : ""}`}>
				<Routes>
					{/* Redirect based on user role */}
					<Route path="/" element={!authUser ? <LandingPage /> : isDoctor ? <DashboardPage /> : <HomePage />} />
					
					<Route path="/patientDashboard" element={isPatient ? <HomePage /> : <Navigate to="/login" />} />
					<Route path="/doctorDashboard" element={isDoctor ? <DashboardPage /> : <Navigate to="/login" />} />
					
					<Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
					<Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
					<Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
					<Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
					<Route path="/supporters" element={authUser ? <ProfilesPage /> : <Navigate to="/login" />} />
				</Routes>
			</div>

			{/* Right Panel for patients only */}
			{isPatient && <RightPanel />}

			<Toaster />
		</div>
	);
}

export default App;
