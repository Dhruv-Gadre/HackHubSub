import React, { useState } from 'react';
import { User, Phone, Mail, Calendar, MapPin, Award, Clock, MessageSquare, X } from 'lucide-react';
import pfp from "../../assets/profile-pictures/user1.jpg"

// Modal Component for Rescheduling
const RescheduleModal = ({ isOpen, onClose, onSave, role, currentAppointment }) => {
    // Parse the current date for the input value
    const parseDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get initial date in YYYY-MM-DD format for the input
    const getCurrentDate = () => {
        try {
            // Remove any comma and convert month name to month number
            const dateParts = currentAppointment.date.split(' ');
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthIndex = monthNames.findIndex(m => m === dateParts[0]);

            if (monthIndex !== -1) {
                const year = dateParts[2];
                const day = dateParts[1].replace(',', '');
                const month = (monthIndex + 1).toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
            return new Date().toISOString().split('T')[0]; // Fallback to today
        } catch (e) {
            return new Date().toISOString().split('T')[0]; // Fallback to today
        }
    };

    const [inputDate, setInputDate] = useState(getCurrentDate());
    const [formattedDate, setFormattedDate] = useState(currentAppointment.date);
    const [time, setTime] = useState(currentAppointment.time);

    // Available time slots - in a real app, these would be fetched from an API
    const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "2:30 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

    // Handle date change
    const handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        setInputDate(e.target.value);

        // Format the date for display
        const formattedDate = selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        setFormattedDate(formattedDate);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ date: formattedDate, time });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">
                        Reschedule {role} Appointment
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Select Date
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Calendar size={18} className="text-gray-500" />
                            </div>
                            <input
                                type="date"
                                value={inputDate}
                                onChange={handleDateChange}
                                className={`w-full p-2 pl-10 border rounded focus:outline-none focus:ring-2 ${role === 'Doctor' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-green-500 focus:border-green-500'
                                    }`}
                                required
                            />
                        </div>
                        {formattedDate && (
                            <div className={`mt-2 text-sm ${role === 'Doctor' ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                Selected: {formattedDate}
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                            Select Time
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setTime(slot)}
                                    className={`py-2 px-3 rounded text-sm ${time === slot
                                            ? role === 'Doctor'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-green-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded text-white ${role === 'Doctor'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProfileCard = ({ person, role }) => {
    const [showContact, setShowContact] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className={`p-6 ${role === 'Doctor' ? 'bg-blue-50' : 'bg-green-50'}`}>
                <div className="flex items-center mb-4">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden mr-4 border-4 border-white shadow-sm">
                        <img
                            src={pfp}
                            alt={person.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl">{person.name}</h3>
                        <div className={`${role === 'Doctor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-1`}>
                            {role}
                        </div>
                        <p className="text-gray-600 mt-1 text-sm">{person.specialty}</p>
                    </div>
                </div>

                {/* Bio */}
                <p className="text-gray-700 mb-4">{person.bio}</p>

                {/* Stats/Badges */}
                <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Award size={16} className="mr-1" />
                        <span>{person.experience} Years</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <User size={16} className="mr-1" />
                        <span>{person.patients}+ Patients</span>
                    </div>
                    {role === 'Mentor' && (
                        <div className="flex items-center text-sm text-gray-600">
                            <Clock size={16} className="mr-1" />
                            <span>{person.recoveryTime}</span>
                        </div>
                    )}
                </div>

                {/* Contact Button */}
                <button
                    onClick={() => setShowContact(!showContact)}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${role === 'Doctor' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} transition-colors`}
                >
                    {showContact ? 'Hide Contact Info' : 'Show Contact Info'}
                </button>
            </div>

            {/* Contact Info Section */}
            {showContact && (
                <div className="p-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                            <Phone size={16} className="mr-2" />
                            <span>{person.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Mail size={16} className="mr-2" />
                            <span>{person.email}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Calendar size={16} className="mr-2" />
                            <span>Available: {person.availability}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <MapPin size={16} className="mr-2" />
                            <span>{person.location}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AppointmentSection = ({ role, appointment, onReschedule }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className={`mt-4 p-4 rounded-lg ${role === 'Doctor' ? 'bg-blue-50' : 'bg-green-50'}`}>
                <h4 className="font-medium text-gray-900 mb-2">Next {role} Appointment</h4>
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Calendar size={18} className="mr-2 text-gray-600" />
                        <span>{appointment.date} at {appointment.time}</span>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="py-1 px-3 rounded-md bg-white border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
                    >
                        Reschedule
                    </button>
                </div>
            </div>

            <RescheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(newAppointment) => onReschedule(newAppointment)}
                role={role}
                currentAppointment={appointment}
            />
        </>
    );
};

const ProfilesPage = () => {
    // Sample data (in a real app, this would come from props or an API)
    const doctor = {
        name: "Dr. Sarah Johnson",
        specialty: "Addiction Medicine Specialist",
        bio: "Dr. Johnson specializes in evidence-based treatment approaches for substance use disorders with 12 years of clinical experience. Her compassionate approach focuses on whole-person recovery.",
        experience: 12,
        patients: 450,
        phone: "(555) 123-4567",
        email: "dr.johnson@recoveryhealth.com",
        availability: "Mon-Thu, 9AM-5PM",
        location: "Recovery Health Center, Building A"
    };

    const mentor = {
        name: "Michael Williams",
        specialty: "Recovery Coach & Peer Support",
        bio: "Michael has been in recovery for 6 years and uses his personal experience to guide others through their journey. He specializes in relapse prevention and building healthy coping mechanisms.",
        experience: 4,
        patients: 120,
        recoveryTime: "6 Years Sober",
        phone: "(555) 987-6543",
        email: "michael.w@recoveryhealth.com",
        availability: "Mon-Fri, 10AM-7PM",
        location: "Recovery Health Center, Building B"
    };

    // State for managing appointments
    const [doctorAppointment, setDoctorAppointment] = useState({
        date: "March 10, 2025",
        time: "2:30 PM"
    });

    const [mentorAppointment, setMentorAppointment] = useState({
        date: "March 8, 2025",
        time: "4:00 PM"
    });

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Your Support Team</h1>
                    <p className="text-gray-600 mt-2">
                        Meet the professionals supporting your recovery journey
                    </p>
                </header>

                <div className="space-y-8">
                    <div>
                        <ProfileCard person={doctor} role="Doctor" />
                        <AppointmentSection
                            role="Doctor"
                            appointment={doctorAppointment}
                            onReschedule={setDoctorAppointment}
                        />
                        <div className="mt-4">
                            <button className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors">
                                <MessageSquare size={18} className="mr-2" />
                                Message Dr. Johnson
                            </button>
                        </div>
                    </div>

                    <div>
                        <ProfileCard person={mentor} role="Mentor" />
                        <AppointmentSection
                            role="Mentor"
                            appointment={mentorAppointment}
                            onReschedule={setMentorAppointment}
                        />
                        <div className="mt-4">
                            <button className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-white border border-green-300 text-green-600 hover:bg-green-50 transition-colors">
                                <MessageSquare size={18} className="mr-2" />
                                Message Michael
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilesPage;