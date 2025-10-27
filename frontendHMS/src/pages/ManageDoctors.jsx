import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Eye, Search, RefreshCw } from 'lucide-react';

function ManageDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        const filtered = doctors.filter(doctor =>
            doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.phone?.includes(searchTerm)
        );
        setFilteredDoctors(filtered);
    }, [searchTerm, doctors]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/admin/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data);
            setFilteredDoctors(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load doctors');
            setLoading(false);
        }
    };

    const handleViewDetails = async (doctorId) => {
        try {
            const response = await axios.get(`http://localhost:8080/admin/doctors/${doctorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedDoctor(response.data);
            setShowModal(true);
        } catch (err) {
            alert('Failed to load doctor details');
        }
    };

    const handleDeleteDoctor = async (doctorId) => {
        if (!window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/admin/doctors/${doctorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Doctor deleted successfully');
            fetchDoctors();
        } catch (err) {
            alert('Failed to delete doctor');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl">Loading doctors...</div>
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
                    <h1 className="text-3xl font-bold text-white mb-2">Manage Doctors</h1>
                    <p className="text-gray-400">Total Doctors: {doctors.length}</p>
                </div>
                <button
                    onClick={fetchDoctors}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, specialty, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Doctors Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Specialty</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        {filteredDoctors.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    No doctors found
                                </td>
                            </tr>
                        ) : (
                            filteredDoctors.map((doctor) => (
                                <tr key={doctor.id} className="hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-300">{doctor.id}</td>
                                    <td className="px-6 py-4 text-sm text-white font-medium">{doctor.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{doctor.email}</td>
                                    <td className="px-6 py-4 text-sm text-blue-400">{doctor.specialty}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{doctor.phone}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(doctor.id)}
                                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDoctor(doctor.id)}
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

            {/* Modal for Doctor Details */}
            {showModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-3xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Doctor Details</h2>
                        <div className="space-y-4 text-gray-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">ID</p>
                                    <p className="text-white font-semibold">{selectedDoctor.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Name</p>
                                    <p className="text-white font-semibold">{selectedDoctor.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Email</p>
                                    <p className="text-white font-semibold">{selectedDoctor.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Phone</p>
                                    <p className="text-white font-semibold">{selectedDoctor.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Specialty</p>
                                    <p className="text-white font-semibold">{selectedDoctor.specialty}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-700 pt-4">
                                <p className="text-gray-400 text-sm mb-2">Available Days</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedDoctor.availableDays?.map((day, idx) => (
                                        <span key={idx} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-gray-700 pt-4">
                                <p className="text-gray-400 text-sm mb-2">Available Time</p>
                                <p className="text-white font-semibold">
                                    {selectedDoctor.availableFrom} - {selectedDoctor.availableTo}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageDoctors;