import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TrendingUp, Users, Calendar, RefreshCw, Activity, CheckCircle } from 'lucide-react';

const COLORS = {
    scheduled: '#F59E0B',
    completed: '#10B981',
    cancelled: '#EF4444',
    patients: '#3B82F6',
    doctors: '#8B5CF6',
    admins: '#EC4899'
};

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
                const appointmentsResponse = await axios.get('http://localhost:8080/admin/appointments/recent?limit=10', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecentAppointments(appointmentsResponse.data || []);
            } catch (aptError) {
                console.error('Failed to load recent appointments:', aptError);
                setRecentAppointments([]);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching statistics:', err);
            setError('Failed to load statistics. Please try again.');
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        try {
            const date = new Date(dateTimeStr);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleString();
        } catch {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl flex items-center gap-2">
                    <Activity className="w-6 h-6 animate-spin" />
                    Loading statistics...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                    {error}
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg">
                No statistics data available
            </div>
        );
    }

    // Prepare chart data
    const appointmentStatusData = [
        { name: 'Scheduled', value: Number(stats.scheduledAppointments) || 0, color: COLORS.scheduled },
        { name: 'Completed', value: Number(stats.completedAppointments) || 0, color: COLORS.completed },
        { name: 'Cancelled', value: Number(stats.cancelledAppointments) || 0, color: COLORS.cancelled },
    ].filter(item => item.value > 0);

    const userTypeData = [
        { name: 'Patients', value: Number(stats.totalPatients) || 0, color: COLORS.patients },
        { name: 'Doctors', value: Number(stats.totalDoctors) || 0, color: COLORS.doctors },
        { name: 'Admins', value: Number(stats.totalAdmins) || 0, color: COLORS.admins },
    ].filter(item => item.value > 0);

    const completionRate = stats.totalAppointments > 0
        ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
        : 0;

    // Custom label for pie charts
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="font-bold text-sm"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 shadow-xl flex-1">
                    <h1 className="text-4xl font-bold text-white mb-2">System Statistics</h1>
                    <p className="text-blue-100">Comprehensive analytics and insights</p>
                </div>
                <button
                    onClick={fetchData}
                    className="ml-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 shadow-lg"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-10 h-10 text-white opacity-80" />
                    </div>
                    <h3 className="text-white/80 text-sm font-medium mb-2">Total Users</h3>
                    <p className="text-4xl font-bold text-white">{stats.totalUsers || 0}</p>
                    <p className="text-white/70 text-xs mt-2">All system users</p>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <Calendar className="w-10 h-10 text-white opacity-80" />
                    </div>
                    <h3 className="text-white/80 text-sm font-medium mb-2">Total Appointments</h3>
                    <p className="text-4xl font-bold text-white">{stats.totalAppointments || 0}</p>
                    <p className="text-white/70 text-xs mt-2">{stats.todaysAppointments || 0} today</p>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <CheckCircle className="w-10 h-10 text-white opacity-80" />
                    </div>
                    <h3 className="text-white/80 text-sm font-medium mb-2">Completion Rate</h3>
                    <p className="text-4xl font-bold text-white">{completionRate}%</p>
                    <p className="text-white/70 text-xs mt-2">{stats.completedAppointments || 0} completed</p>
                </div>

                <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-10 h-10 text-white opacity-80" />
                    </div>
                    <h3 className="text-white/80 text-sm font-medium mb-2">Active Now</h3>
                    <p className="text-4xl font-bold text-white">{stats.scheduledAppointments || 0}</p>
                    <p className="text-white/70 text-xs mt-2">Scheduled appointments</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Status Donut Chart */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-400" />
                        Appointment Status
                    </h2>
                    {appointmentStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={appointmentStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={120}
                                    label={renderCustomLabel}
                                    labelLine={false}
                                >
                                    {appointmentStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[320px] flex items-center justify-center text-gray-400">
                            No appointment data available
                        </div>
                    )}
                </div>

                {/* User Distribution Bar Chart */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-400" />
                        User Distribution
                    </h2>
                    {userTypeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={userTypeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[8, 8, 0, 0]}
                                >
                                    {userTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[320px] flex items-center justify-center text-gray-400">
                            No user data available
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-yellow-600/50 shadow-lg">
                    <p className="text-gray-400 text-sm mb-1">Scheduled</p>
                    <p className="text-3xl font-bold text-yellow-400">{stats.scheduledAppointments || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-green-600/50 shadow-lg">
                    <p className="text-gray-400 text-sm mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-400">{stats.completedAppointments || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-red-600/50 shadow-lg">
                    <p className="text-gray-400 text-sm mb-1">Cancelled</p>
                    <p className="text-3xl font-bold text-red-400">{stats.cancelledAppointments || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-blue-600/50 shadow-lg">
                    <p className="text-gray-400 text-sm mb-1">Today</p>
                    <p className="text-3xl font-bold text-blue-400">{stats.todaysAppointments || 0}</p>
                </div>
            </div>

            {/* Recent Appointments Table */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-green-400" />
                    Recent Appointments
                </h2>
                {recentAppointments.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No recent appointments</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Patient</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Doctor</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date & Time</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                            {recentAppointments.slice(0, 5).map((apt) => (
                                <tr key={apt.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-white">{apt.patient?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-white">{apt.doctor?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{formatDateTime(apt.appointmentDateTime)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                                            ${apt.status === 'Scheduled' ? 'bg-yellow-600 text-yellow-100' : ''}
                                            ${apt.status === 'Completed' ? 'bg-green-600 text-green-100' : ''}
                                            ${apt.status === 'Cancelled' ? 'bg-red-600 text-red-100' : ''}
                                        `}>
                                            {apt.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminStatistics;