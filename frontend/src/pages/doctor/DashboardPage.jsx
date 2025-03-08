import React, { useState } from 'react';
import { Heart, LogOut, Award, Calendar, Activity, Users, BookOpen, PlusCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Static demo data for charts and diary entries remain unchanged
const sobrietyData = [
  { day: 'Day 1', progress: 20 },
  { day: 'Day 15', progress: 45 },
  { day: 'Day 30', progress: 65 },
  { day: 'Day 45', progress: 85 },
];

const communityData = [
  { week: 'Week 1', activity: 30 },
  { week: 'Week 2', activity: 45 },
  { week: 'Week 3', activity: 65 },
  { week: 'Week 4', activity: 40 },
];

const diaryEntries = [
  { date: "2024-03-15", entry: "Feeling stronger each day. Group therapy was particularly helpful today." },
  { date: "2024-03-14", entry: "Had some cravings but used the techniques we discussed. Stayed strong." },
  { date: "2024-03-13", entry: "Great day at work. Finding new ways to manage stress." },
];

// Form A questions remain unchanged
const formAQuestions = {
  familyStructure: [
    { id: 'singleParent', label: 'Single Parent', type: 'boolean' },
    { id: 'parentsDuggie', label: 'Parent(s) with Drug History', type: 'boolean' },
  ],
  socioeconomic: [
    { id: 'socioeconomicScale', label: 'Social Economic Status (0-10)', type: 'scale', min: 0, max: 10 },
  ],
  relationships: [
    { id: 'abusiveFamily', label: 'Abusive Relationships - Family', type: 'boolean' },
    { id: 'abusiveFriends', label: 'Abusive Relationships - Friends', type: 'boolean' },
    { id: 'abusivePartner', label: 'Abusive Relationships - Partner', type: 'boolean' },
  ],
  health: [
    { id: 'chronicFamilyHealth', label: 'Chronic Family Health Issues', type: 'boolean' },
    { id: 'spiritualSupport', label: 'Spiritual Support', type: 'boolean' },
    { id: 'selfHarm', label: 'Deliberate Self-Harm (wrist wounds)', type: 'boolean' },
  ],
  sadpersons: [
    { id: 'sexMale', label: 'Sex (Male)', type: 'boolean' },
    { id: 'ageRisk', label: 'Age (<19 or >45)', type: 'boolean' },
    { id: 'depression', label: 'Depression', type: 'boolean' },
    { id: 'previousAttempt', label: 'Previous Attempt', type: 'boolean' },
    { id: 'ethanol', label: 'Ethanol/Substance Abuse', type: 'boolean' },
    { id: 'rationalThinking', label: 'Rational Thinking Loss', type: 'boolean' },
    { id: 'socialSupport', label: 'Social Supports Lacking', type: 'boolean' },
    { id: 'organizedPlan', label: 'Organized Plan', type: 'boolean' },
    { id: 'noPartner', label: 'No Partner', type: 'boolean' },
    { id: 'sickness', label: 'Sickness', type: 'boolean' },
  ],
  additionalAssessment: [
    { id: 'recentPhysicianVisit', label: 'Recent Physician Visit (last month)', type: 'boolean' },
    { id: 'bodyImage', label: 'Body Image/Bullying/Eating Disorders', type: 'boolean' },
    { id: 'sexualAbuse', label: 'Sexual Abuse History', type: 'boolean' },
    { id: 'behaviorChange', label: 'Recent Behavior Changes', type: 'boolean' },
    { id: 'localityDrugs', label: 'Locality prone to drugs/cigarettes/alcohol', type: 'boolean' },
  ],
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch the authenticated user
  const { data: authUser, isLoading: authLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch auth user");
      return data;
    },
    retry: false,
  });

  // Fetch the doctor's patients using the authenticated doctor's ID
  const { data: doctorPatients, isLoading: patientsLoading, error: patientsError } = useQuery({
    queryKey: ["doctorPatients", authUser?._id],
    queryFn: async () => {
      const res = await fetch(`/api/auth/doctor/${authUser._id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch patients");
      return data;
    },
    enabled: !!authUser, // only run when authUser is loaded
  });

  // Local state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showFormA, setShowFormA] = useState(false);
  const [formAData, setFormAData] = useState({});
  const [newPatient, setNewPatient] = useState({
    fullName: '',
    age: '',
    latitude: '',
    longitude: '',
    email: '',
    password: '',
    confirmPassword: '',
    formA: {},
    doctorNotes: '',
  }); 

  // Logout mutation using React Query
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate('/login');
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Logout failed");
    },
  });

  // Add Patient mutation
  const { mutate: addPatient, isLoading: isAddingPatient } = useMutation({
    mutationFn: async (patientData) => {
      const res = await fetch("/api/auth/patientSignup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      // Invalidate the doctorPatients query so the list refreshes
      queryClient.invalidateQueries({ queryKey: ["doctorPatients", authUser._id] });
      toast.success("Patient added successfully");
      setShowAddPatient(false);
      setNewPatient({
        fullName: '',
        age: '',
        latitude: '',
        longitude: '',
        email: '',
        password: '',
        confirmPassword: '',
        formA: {},
        doctorNotes: '',
      });
      setFormAData({});
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add patient");
    },
  });

  // Continue streak mutation
  const { mutate: continueStreak, isLoading: isContinuingStreak } = useMutation({
    mutationFn: async (patientId) => {
      const res = await fetch(`/api/streak/continue`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorPatients", authUser?._id] });
      toast.success("Streak continued successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to continue streak");
    },
  });

  // End streak mutation
  const { mutate: endStreak, isLoading: isEndingStreak } = useMutation({
    mutationFn: async (patientId) => {
      const res = await fetch(`/api/streak/end`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorPatients", authUser?._id] });
      toast.success("Streak reset successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset streak");
    },
  });

  // Helper to get badge color
  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Bronze': return 'bg-amber-600';
      case 'Silver': return 'bg-gray-400';
      case 'Gold': return 'bg-yellow-400';
      default: return 'bg-teal-600';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormAChange = (questionId, value) => {
    setFormAData((prev) => ({ ...prev, [questionId]: value }));
  };

  // Calculate a grade based on Form A responses
  const calculateGrade = () => {
    let score = 0;
    const sadpersonsScore = formAQuestions.sadpersons.reduce(
      (acc, question) => acc + (formAData[question.id] ? 1 : 0),
      0
    );
    const riskFactors = [
      formAData.abusiveFamily,
      formAData.abusiveFriends,
      formAData.abusivePartner,
      formAData.selfHarm,
      formAData.recentPhysicianVisit,
      formAData.sexualAbuse,
    ].filter(Boolean).length;
    const protectiveFactors = [
      formAData.spiritualSupport,
      !formAData.socialSupport, // inverted because the question checks for lack of support
    ].filter(Boolean).length;
    score = sadpersonsScore * 2 + riskFactors - protectiveFactors;
    if (score >= 15) return 'D';
    if (score >= 10) return 'C';
    if (score >= 5) return 'B';
    return 'A';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const grade = calculateGrade();
    const patientData = {
      ...newPatient,
      formA: formAData,
      grade,
      doctor: authUser._id, // assign the doctor from authUser
    };
    if (patientData.password !== patientData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    addPatient(patientData);
  };

  const renderFormASection = (section, title) => (
    <div className="space-y-4 border-b border-gray-200 pb-4 mb-4">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <div className="grid grid-cols-1 gap-4">
        {section.map((question) => (
          <div key={question.id} className="flex items-center space-x-4">
            {question.type === 'boolean' ? (
              <label className="flex items-center space-x-3 text-gray-700">
                <input
                  type="checkbox"
                  checked={formAData[question.id] || false}
                  onChange={(e) => handleFormAChange(question.id, e.target.checked)}
                  className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <span>{question.label}</span>
              </label>
            ) : (
              <div className="w-full">
                <label className="block text-gray-700 mb-2">{question.label}</label>
                <input
                  type="range"
                  min={question.min}
                  max={question.max}
                  value={formAData[question.id] || 0}
                  onChange={(e) => handleFormAChange(question.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{question.min}</span>
                  <span>{formAData[question.id] || 0}</span>
                  <span>{question.max}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6" />
            <span className="text-xl font-bold">RecoveryPath</span>
          </div>
          <button onClick={() => logout()} className="flex items-center space-x-2 hover:text-yellow-400 transition-colors">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto py-6 px-4 flex gap-6">
        {/* Patient List */}
        <div className="w-1/4 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Patients</h2>
            <button onClick={() => setShowAddPatient(true)} className="flex items-center space-x-1 text-teal-600 hover:text-teal-700 transition-colors">
              <PlusCircle className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
          <div className="space-y-3">
            {patientsLoading ? (
              <p>Loading patients...</p>
            ) : patientsError ? (
              <p>Error loading patients</p>
            ) : (
              doctorPatients?.patients?.map((patient) => (
                <button
                  key={patient._id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full p-4 rounded-lg transition-all hover:shadow-md hover:transform hover:scale-[1.02] ${
                    selectedPatient?._id === patient._id
                      ? 'bg-teal-50 border-2 border-teal-500'
                      : 'bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800">{patient.fullName}</h3>
                      <p className="text-sm text-gray-500">Last active: {patient.lastUpdated || "N/A"}</p>
                    </div>
                    {/* <div className={`${getBadgeColor(patient.sobrietyStreak)} text-white text-xs px-2 py-1 rounded-full`}>
                      {patient.badge || "Member"}
                    </div> */}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Patient Details */}
        <div className="w-3/4 bg-white rounded-xl shadow-lg p-6">
          {!selectedPatient ? (
            <div className="h-full flex items-center justify-center text-center p-8">
              <p className="text-2xl text-gray-600 italic">
                "Your guidance may be the light that leads someone out of their darkest place"
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Patient Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.fullName}</h2>
                  <p className="text-gray-600">Patient Progress Overview</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  <span className="font-semibold">{selectedPatient.sobrietyStreak <= 0 ? "Copper" : selectedPatient.sobrietyStreak <= 10 ? "Bronze": selectedPatient.sobrietyStreak <= 30 ? "Silver" : "Gold"} Member</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-teal-600" />
                    <span className="font-semibold text-gray-700">Days Sober</span>
                  </div>
                  <p className="text-2xl font-bold text-teal-600 mt-2">{selectedPatient.sobrietyStreak || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-gray-700">Current Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">{selectedPatient.streak || 4 } days</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-700">Community Status</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mt-2">Active</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Recovery Progress</h3>
                  <LineChart width={400} height={200} data={sobrietyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="progress" stroke="#0D9488" />
                  </LineChart>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Community Activity</h3>
                  <AreaChart width={400} height={200} data={communityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="activity" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} />
                  </AreaChart>
                </div>
              </div>

              {/* Diary Entries */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                  <h3 className="text-lg font-semibold">Recent Diary Entries</h3>
                </div>
                <div className="space-y-4">
                  {diaryEntries.map((entry, index) => (
                    <div key={index} className="border-l-4 border-teal-500 pl-4 py-2">
                      <p className="text-sm text-gray-500">{entry.date}</p>
                      <p className="text-gray-700 mt-1">{entry.entry}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak Management Buttons */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Streak Management</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => continueStreak(selectedPatient._id)}
                    disabled={isContinuingStreak}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isContinuingStreak ? "Processing..." : "Continue Streak"}
                  </button>
                  <button
                    onClick={() => endStreak(selectedPatient._id)}
                    disabled={isEndingStreak}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEndingStreak ? "Processing..." : "Break Streak"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Patient</h2>
              <button onClick={() => setShowAddPatient(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={newPatient.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={newPatient.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={newPatient.latitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={newPatient.longitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newPatient.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={newPatient.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={newPatient.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => setShowFormA(!showFormA)}
                  className="flex items-center justify-between w-full text-left text-gray-700 font-medium"
                >
                  <span>Form A - Patient Assessment</span>
                  {showFormA ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {showFormA && (
                  <div className="mt-6 space-y-6">
                    {renderFormASection(formAQuestions.familyStructure, "Family Structure")}
                    {renderFormASection(formAQuestions.socioeconomic, "Socioeconomic Status")}
                    {renderFormASection(formAQuestions.relationships, "Relationships")}
                    {renderFormASection(formAQuestions.health, "Health & Support")}
                    {renderFormASection(formAQuestions.sadpersons, "SADPERSONS Assessment")}
                    {renderFormASection(formAQuestions.additionalAssessment, "Additional Assessment")}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Notes</label>
                      <textarea
                        name="doctorNotes"
                        value={newPatient.doctorNotes}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Add any additional observations or notes..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPatient}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingPatient ? "Adding..." : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;