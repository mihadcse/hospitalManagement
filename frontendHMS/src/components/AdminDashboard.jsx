import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    FiLogOut,
    FiUsers,
    FiUserCheck,
    FiCalendar,
    FiBarChart2,
    FiHome
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Check if user is admin
    React.useEffect(() => {
        if (!user || user.userType !== 'admin') {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { to: "/admin/dashboard", label: "Dashboard", icon: <FiHome /> },
        { to: "/admin/dashboard/patients", label: "Manage Patients", icon: <FiUsers /> },
        { to: "/admin/dashboard/doctors", label: "Manage Doctors", icon: <FiUserCheck /> },
        { to: "/admin/dashboard/appointments", label: "All Appointments", icon: <FiCalendar /> },
        { to: "/admin/dashboard/statistics", label: "System Statistics", icon: <FiBarChart2 /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-900">
            {/* Sidebar */}
            <nav className="w-64 bg-gray-800 text-white h-screen sticky top-0 flex flex-col p-6 shadow-lg border-r border-gray-700">
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-center mb-2 text-blue-400">
                        Admin Panel
                    </h2>
                    <p className="text-center text-gray-400 text-sm">
                        {user?.name || 'Administrator'}
                    </p>
                </div>

                <ul className="flex flex-col gap-2 flex-grow">
                    {navItems.map(({ to, label, icon }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                                    ${isActive(to)
                                    ? 'bg-blue-600 shadow-lg'
                                    : 'hover:bg-gray-700 focus:bg-gray-700 focus:outline-none'
                                }
                                `}
                                tabIndex={0}
                            >
                                <span className="text-xl">{icon}</span>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-lg font-semibold bg-red-600 hover:bg-red-700 shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                        aria-label="Logout"
                    >
                        <FiLogOut className="w-6 h-6" />
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto bg-gray-900">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminDashboard;