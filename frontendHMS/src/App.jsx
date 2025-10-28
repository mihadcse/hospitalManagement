import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './components/Home';
import PatientRegistration from './components/PatientRegistration';
import PatientDashboard from './components/PatientDashboard';
import PatientWelcomeDashboard from './pages/PatientWelcomeDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import UpcomingAppointments from './pages/UpcomingAppointments';
import AppointmentStats from './pages/AppointmentStats';
import DashboardOverview from './pages/DashboardOverview';
import PatientAppointment from './pages/PatientAppointment';
import PatientPastAppointments from './pages/PatientPastAppointments';
import Prescription from './pages/Prescription';
import PatientPrescriptions from './pages/PatientPrescriptions';

// Admin Components
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminOverview from './pages/AdminOverview';
import ManagePatients from './pages/ManagePatients';
import ManageDoctors from './pages/ManageDoctors';
import PendingDoctors from './pages/PendingDoctors';
import RejectedDoctors from './pages/RejectedDoctors';  // NEW IMPORT
import ManageAppointments from './pages/ManageAppointments';
import AdminStatistics from './pages/AdminStatistics';

import { useAuth } from './context/AuthContext';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-xl font-semibold text-white">Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <NavBar />
            <div className="container mx-auto p-4">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<PatientRegistration />} />

                    {/* Admin Routes - Accessible via direct URL */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin/dashboard/*"
                        element={
                            user?.userType === 'admin' ? (
                                <AdminDashboard />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    >
                        <Route index element={<AdminOverview />} />
                        <Route path="patients" element={<ManagePatients />} />
                        <Route path="doctors" element={<ManageDoctors />} />
                        <Route path="pending-doctors" element={<PendingDoctors />} />
                        <Route path="rejected-doctors" element={<RejectedDoctors />} />  {/* NEW ROUTE */}
                        <Route path="appointments" element={<ManageAppointments />} />
                        <Route path="statistics" element={<AdminStatistics />} />
                    </Route>

                    {/* Protected Routes - Require Login */}
                    {!user ? (
                        <Route path="*" element={<Navigate to="/register" replace />} />
                    ) : (
                        <>
                            {/* Doctor Dashboard Routes */}
                            <Route
                                path="/doctordashboard/*"
                                element={
                                    user.userType === 'doctor' ? (
                                        <DoctorDashboard />
                                    ) : (
                                        <Navigate to="/patientdashboard" replace />
                                    )
                                }
                            >
                                <Route index element={<DoctorProfile doctorId={user.id} />} />
                                <Route path="profile" element={<DoctorProfile doctorId={user.id} />} />
                                <Route path="appointments" element={<UpcomingAppointments doctorId={user.id} />} />
                                <Route path="stats" element={<AppointmentStats doctorId={user.id} />} />
                                <Route path="dashboard" element={<DashboardOverview doctorId={user.id} />} />
                                <Route path="prescriptions/:patientId" element={<Prescription />} />
                            </Route>

                            {/* Patient Routes */}
                            <Route
                                path="/patientdashboard"
                                element={
                                    user.userType === 'patient' ? (
                                        <PatientWelcomeDashboard patientId={user.id} />
                                    ) : (
                                        <Navigate to="/doctordashboard" replace />
                                    )
                                }
                            />
                            <Route
                                path="/appointment"
                                element={
                                    user.userType === 'patient' ? (
                                        <PatientAppointment patientId={user.id} />
                                    ) : (
                                        <Navigate to="/register" replace />
                                    )
                                }
                            />
                            <Route
                                path="/Patient-appointments"
                                element={
                                    user.userType === 'patient' ? (
                                        <PatientPastAppointments patientId={user.id} />
                                    ) : (
                                        <Navigate to="/register" replace />
                                    )
                                }
                            />
                            <Route path="/patient/prescriptions/:id" element={<PatientPrescriptions />} />

                            {/* Catch-all for logged in users */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </>
                    )}
                </Routes>
            </div>
        </Router>
    );
}

export default App;