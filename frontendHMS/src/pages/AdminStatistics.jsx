import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TrendingUp, Users, Calendar, RefreshCw } from 'lucide-react';

const COLORS = ['#F59E0B', '#10B981', '#EF4444', '#3B82F6'];

function AdminStatistics() {
    const [stats, setStats] = useState(null);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const statsResponse = await axios.get('http://localhost:8080/admin/statistics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsResponse.data);

            try {
                const appointmentsResponse = await axios.get('http://localhost:8080/admin/appointments/recent?limit=5', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecentAppointments(appointmentsResponse.data || []);
            } catch {
                setRecentAppointments([]);
            }

            setLoading(false);
        } catch (err) {
            setError('Failed to load statistics. Please try again.');
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        const date = new Date(dateTimeStr);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl">Loading statistics...</div>
            </div>
        );

    if (error)
        return (
            <div className="space-y-4">
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                    {error}
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    <RefreshCw className="w-4 h-4" /> Retry
                </button>
            </div>
        );

    if (!stats)
        return (
            <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg">
                No statistics data available
            </div>
        );

    // Chart data
    const appointmentData = [
        { name: 'Scheduled', value: Number(stats.scheduledAppointments) || 0 },
        { name: 'Completed', value: Number(stats.completedAppointments) || 0 },
        { name: 'Cancelled', value: Number(stats.cancelledAppointments) || 0 }
    ].filter(i => i.value > 0);

    const userTypeData = [
        { name: 'Patients', value: Number(stats.totalPatients) || 0 },
        { name: 'Doctors', value: Number(stats.totalDoctors) || 0 },
        { name: 'Admins', value: Number(stats.totalAdmins) || 0 }
    ].filter(i => i.value > 0);

    const completionRate = stats.totalAppointments
        ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
        : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 shadow-xl flex-1">
                    <h1 className="text-4xl font-bold text-white mb-2">System Statistics</h1>
                    <p className="text-blue-100">Comprehensive overview of system metrics</p>
                </div>
                <button
                    onClick={fetchData}
                    className="ml-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <Users className="w-10 h-10 text-blue-400 mb-4" />
                    <h3 className="text-gray-400 text-sm mb-1">Total Users</h3>
                    <p className="text-4xl font-bold text-white">{stats.totalUsers || 0}</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <Calendar className="w-10 h-10 text-purple-400 mb-4" />
                    <h3 className="text-gray-400 text-sm mb-1">Total Appointments</h3>
                    <p className="text-4xl font-bold text-white">{stats.totalAppointments || 0}</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <TrendingUp className="w-10 h-10 text-green-400 mb-4" />
                    <h3 className="text-gray-400 text-sm mb-1">Completion Rate</h3>
                    <p className="text-4xl font-bold text-white">{completionRate}%</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Pie */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6">Appointment Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={appointmentData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {appointmentData.map((entry, index) =>
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                )}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', color: '#fff' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* User Bar */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6">User Types</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userTypeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Appointments</h2>
                {recentAppointments.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-gray-300">Patient</th>
                                <th className="px-4 py-3 text-left text-gray-300">Doctor</th>
                                <th className="px-4 py-3 text-left text-gray-300">Date & Time</th>
                                <th className="px-4 py-3 text-left text-gray-300">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                            {recentAppointments.map(apt => (
                                <tr key={apt.id}>
                                    <td className="px-4 py-3 text-white">{apt.patient?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-white">{apt.doctor?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-gray-300">{formatDateTime(apt.appointmentDateTime)}</td>
                                    <td className="px-4 py-3 text-gray-300">{apt.status}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No recent appointments</p>
                )}
            </div>

        </div>
    );
}

export default AdminStatistics;
