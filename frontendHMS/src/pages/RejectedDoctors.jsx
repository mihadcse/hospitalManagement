import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { XCircle, Eye, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';

function RejectedDoctors() {
    const [rejectedDoctors, setRejectedDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        fetchRejectedDoctors();
    }, []);

    const fetchRejectedDoctors = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:8080/admin/doctors/rejected', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRejectedDoctors(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching rejected doctors:', err);
            setError('Failed to load rejected doctors');
            setLoading(false);
        }
    };

    const handleReApprove = async (doctorId) => {
        if (!window.confirm('Are you sure you want to re-approve this doctor? They will be able to login immediately.')) {
            return;
        }

        try {
            setSubmitting(true);
            await axios.put(
                `http://localhost:8080/admin/doctors/${doctorId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('✅ Doctor re-approved successfully!');
            fetchRejectedDoctors();
            if (showModal) setShowModal(false);
        } catch (err) {
            console.error('Error re-approving doctor:', err);
            alert('❌ Failed to re-approve doctor: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDoctor = async (doctorId) => {
        if (!window.confirm('Are you sure you want to permanently delete this doctor? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/admin/doctors/${doctorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Doctor deleted successfully');
            fetchRejectedDoctors();
        } catch (err) {
            alert('❌ Failed to delete doctor: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleString();
        } catch {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl flex items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Loading rejected doctors...
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
                    onClick={fetchRejectedDoctors}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Rejected Doctor Applications</h1>
                    <p className="text-gray-400">Review previously rejected registrations</p>
                </div>
                <button
                    onClick={fetchRejectedDoctors}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Rejected Doctors Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Specialty</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rejection Reason</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        {rejectedDoctors.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    <XCircle className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                                    <p>No rejected doctors</p>
                                </td>
                            </tr>
                        ) : (
                            rejectedDoctors.map((doctor) => (
                                <tr key={doctor.id} className="hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 text-sm text-white font-medium">{doctor.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{doctor.email}</td>
                                    <td className="px-6 py-4 text-sm text-blue-400">{doctor.specialty}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{doctor.phone}</td>
                                    <td className="px-6 py-4 text-sm text-red-300 max-w-xs truncate" title={doctor.rejectionReason || 'No reason provided'}>
                                        {doctor.rejectionReason || 'No reason provided'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedDoctor(doctor);
                                                    setShowModal(true);
                                                }}
                                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleReApprove(doctor.id)}
                                                disabled={submitting}
                                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Re-Approve
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

            {/* Details Modal */}
            {showModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-3xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Rejected Doctor Details</h2>
                        <div className="space-y-4 text-gray-300">
                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <p className="text-gray-400 text-sm">Registration Date</p>
                                    <p className="text-white font-semibold">{formatDate(selectedDoctor.registrationDate)}</p>
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
                            <div className="border-t border-gray-700 pt-4">
                                <p className="text-gray-400 text-sm mb-2">Rejection Reason</p>
                                <div className="bg-red-900/30 p-4 rounded-lg border border-red-600">
                                    <p className="text-red-300 font-semibold">
                                        {selectedDoctor.rejectionReason || 'No reason provided'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition duration-200"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    handleReApprove(selectedDoctor.id);
                                }}
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Re-Approve
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    handleDeleteDoctor(selectedDoctor.id);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RejectedDoctors;