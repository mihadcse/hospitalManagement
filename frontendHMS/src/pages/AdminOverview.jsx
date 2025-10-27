import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, UserCheck, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

function AdminOverview() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/admin/statistics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load statistics');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: <Users className="w-8 h-8" />,
            color: 'bg-blue-600',
            textColor: 'text-blue-400'
        },
        {
            title: 'Total Patients',
            value: stats?.totalPatients || 0,
            icon: <Users className="w-8 h-8" />,
            color: 'bg-green-600',
            textColor: 'text-green-400'
        },
        {
            title: 'Total Doctors',
            value: stats?.totalDoctors || 0,
            icon: <UserCheck className="w-8 h-8" />,
            color: 'bg-purple-600',
            textColor: 'text-purple-400'
        },
        {
            title: 'Total Appointments',
            value: stats?.totalAppointments || 0,
            icon: <Calendar className="w-8 h-8" />,
            color: 'bg-indigo-600',
            textColor: 'text-indigo-400'
        },
        {
            title: 'Scheduled',
            value: stats?.scheduledAppointments || 0,
            icon: <Clock className="w-8 h-8" />,
            color: 'bg-yellow-600',
            textColor: 'text-yellow-400'
        },
        {
            title: 'Completed',
            value: stats?.completedAppointments || 0,
            icon: <CheckCircle className="w-8 h-8" />,
            color: 'bg-teal-600',
            textColor: 'text-teal-400'
        },
        {
            title: 'Cancelled',
            value: stats?.cancelledAppointments || 0,
            icon: <XCircle className="w-8 h-8" />,
            color: 'bg-red-600',
            textColor: 'text-red-400'
        },
        {
            title: "Today's Appointments",
            value: stats?.todaysAppointments || 0,
            icon: <Calendar className="w-8 h-8" />,
            color: 'bg-pink-600',
            textColor: 'text-pink-400'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 shadow-xl">
                <h1 className="text-4xl font-bold text-white mb-2">System Dashboard</h1>
                <p className="text-blue-100">Overview of healthcare management system</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${card.color} p-3 rounded-lg`}>
                                {card.icon}
                            </div>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-2">{card.title}</h3>
                        <p className={`text-4xl font-bold ${card.textColor}`}>
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => window.location.href = '/admin/dashboard/patients'}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200"
                    >
                        Manage Patients
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin/dashboard/doctors'}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200"
                    >
                        Manage Doctors
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin/dashboard/appointments'}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200"
                    >
                        View All Appointments
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminOverview;