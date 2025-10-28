import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { XCircle, Eye, RefreshCw, RotateCcw } from 'lucide-react';

function RejectedDoctors() {
    const [rejectedDoctors, setRejectedDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showModal, setShowModal] = useState(false);

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
        if (!window.confirm('Are you sure you want to re-approve this doctor?')) {
            return;
        }

        try {
            await axios.put(
                `http://localhost:8080/admin/doctors/${doctorId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('✅ Doctor re-approved successfully!');
            fetchRejectedDoctors();
        } catch (err) {
            alert('❌ Failed to re-approve doctor: ' + err.message);
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
                <div className="text-white text-xl">Loading rejected doctors...</div>
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
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rejection Reason</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        {rejectedDoctors.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                    No rejected doctors
                                </td>
                            </tr>
                        ) : (
                            rejectedDoctors.map((doctor) => (
                                <tr key={doctor.id} className="hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 text-sm text-white font-medium">{doctor.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{doctor.email}</td>
                                    <td className="px-6 py-4 text-sm text-blue-400">{doctor.specialty}</td>
                                    <td className="px-6 py-4 text-sm text-red-300">
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
                                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Re-Approve
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
                    <div className="bg-gray-800 rounded-xl p-8 max-w-3xl w-full mx-4 border border-gray-700">
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
                            </div>
                            <div className="border-t border-gray-700 pt-4">
                                <p className="text-gray-400 text-sm mb-2">Rejection Reason</p>
                                <p className="text-red-300 font-semibold bg-red-900/30 p-3 rounded">
                                    {selectedDoctor.rejectionReason || 'No reason provided'}
                                </p>
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
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Re-Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RejectedDoctors;