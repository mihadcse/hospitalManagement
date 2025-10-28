import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, XCircle, Search, RefreshCw, Calendar, Filter } from 'lucide-react';

function ManageAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        let filtered = appointments;

        // Filter by status
        if (statusFilter !== 'All') {
            filtered = filtered.filter(apt => apt.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(apt =>
                apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.id?.toString().includes(searchTerm)
            );
        }

        setFilteredAppointments(filtered);
    }, [searchTerm, statusFilter, appointments]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/admin/appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
            setFilteredAppointments(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load appointments');
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            await axios.put(
                `http://localhost:8080/admin/appointments/${appointmentId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Appointment cancelled successfully');
            fetchAppointments();
        } catch (err) {
            alert('Failed to cancel appointment');
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to permanently delete this appointment?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/admin/appointments/${appointmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Appointment deleted successfully');
            fetchAppointments();
        } catch (err) {
            alert('Failed to delete appointment');
        }
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString();
        } catch {
            return 'Invalid Date';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Scheduled':
                return 'bg-yellow-600 text-yellow-100';
            case 'Completed':
                return 'bg-green-600 text-green-100';
            case 'Cancelled':
                return 'bg-red-600 text-red-100';
            default:
                return 'bg-gray-600 text-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl">Loading appointments...</div>
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Manage Appointments</h1>
                    <p className="text-gray-400">Total Appointments: {appointments.length}</p>
                </div>
                <button
                    onClick={fetchAppointments}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by patient name, doctor name, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Status</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Patient</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Doctor</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date & Time</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    No appointments found
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-300">{appointment.id}</td>
                                    <td className="px-6 py-4 text-sm text-white font-medium">
                                        {appointment.patient?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white font-medium">
                                        {appointment.doctor?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {formatDateTime(appointment.appointmentDateTime)}
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {appointment.status === 'Scheduled' && (
                                                <button
                                                    onClick={() => handleCancelAppointment(appointment.id)}
                                                    className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteAppointment(appointment.id)}
                                                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Total</p>
                    <p className="text-2xl font-bold text-white">{appointments.length}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Scheduled</p>
                    <p className="text-2xl font-bold text-yellow-400">
                        {appointments.filter(a => a.status === 'Scheduled').length}
                    </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-400">
                        {appointments.filter(a => a.status === 'Completed').length}
                    </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Cancelled</p>
                    <p className="text-2xl font-bold text-red-400">
                        {appointments.filter(a => a.status === 'Cancelled').length}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ManageAppointments;