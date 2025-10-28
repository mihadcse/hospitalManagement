import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, Clock, RefreshCw, AlertCircle } from 'lucide-react';

function PendingDoctors() {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [doctorToReject, setDoctorToReject] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        fetchPendingDoctors();
    }, []);

    const fetchPendingDoctors = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:8080/admin/doctors/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // REMOVED THE FILTER - backend now returns only truly pending doctors
            setPendingDoctors(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching pending doctors:', err);
            setError('Failed to load pending doctors');
            setLoading(false);
        }
    };

    const handleViewDetails = (doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
    };

    const handleApproveDoctor = async (doctorId) => {
        if (!window.confirm('Are you sure you want to approve this doctor?')) {
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.put(
                `http://localhost:8080/admin/doctors/${doctorId}/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Approval response:', response.data);
            alert('✅ Doctor approved successfully! They can now login.');

            fetchPendingDoctors();
            if (showModal) setShowModal(false);
        } catch (err) {
            console.error('Error approving doctor:', err);
            alert('❌ Failed to approve doctor: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const openRejectModal = (doctor) => {
        setDoctorToReject(doctor);
        setRejectionReason('');
        setShowRejectModal(true);
        if (showModal) setShowModal(false);
    };

    const handleRejectDoctor = async () => {
        if (!rejectionReason.trim()) {
            alert('⚠️ Please provide a reason for rejection');
            return;
        }

        if (!window.confirm(`Are you sure you want to reject ${doctorToReject.name}'s registration?`)) {
            return;
        }

        try {
            setSubmitting(true);
            console.log('Rejecting doctor:', doctorToReject.id);
            console.log('Rejection reason:', rejectionReason);

            // FIXED: Send reason in the correct format
            const response = await axios.put(
                `http://localhost:8080/admin/doctors/${doctorToReject.id}/reject`,
                { reason: rejectionReason }, // Send as JSON object with "reason" key
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Rejection response:', response.data);
            alert('✅ Doctor registration rejected successfully');

            // Close modal and refresh
            setShowRejectModal(false);
            setDoctorToReject(null);
            setRejectionReason('');
            fetchPendingDoctors();
        } catch (err) {
            console.error('Error rejecting doctor:', err);
            console.error('Error response:', err.response?.data);

            // Better error message
            const errorMessage = err.response?.data?.message
                || err.response?.data
                || err.message
                || 'Unknown error occurred';

            alert('❌ Failed to reject doctor: ' + errorMessage);
        } finally {
            setSubmitting(false);
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
                    Loading pending doctors...
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
                    onClick={fetchPendingDoctors}
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
                    <h1 className="text-3xl font-bold text-white mb-2">Pending Doctor Approvals</h1>
                    <p className="text-gray-400">Review and approve new doctor registrations</p>
                </div>
                <button
                    onClick={fetchPendingDoctors}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Pending Count Alert */}
            {pendingDoctors.length > 0 && (
                <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{pendingDoctors.length} doctor registration(s) awaiting your approval</span>
                </div>
            )}

            {/* Pending Doctors Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Specialty</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Registration Date</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Status</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        {pendingDoctors.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                                    <p>No pending doctor registrations</p>
                                </td>
                            </tr>
                        ) : (
                            pendingDoctors.map((doctor) => (
                                <tr key={doctor.id} className="hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 text-sm text-white font-medium">{doctor.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{doctor.email}</td>
                                    <td className="px-6 py-4 text-sm text-blue-400">{doctor.specialty}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{doctor.phone}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(doctor.registrationDate)}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex justify-center">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600 text-yellow-100 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Pending
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(doctor)}
                                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleApproveDoctor(doctor.id)}
                                                disabled={submitting}
                                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(doctor)}
                                                disabled={submitting}
                                                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
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

            {/* View Details Modal */}
            {showModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-3xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Doctor Details</h2>
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
                                    handleApproveDoctor(selectedDoctor.id);
                                }}
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    openRejectModal(selectedDoctor);
                                }}
                                disabled={submitting}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal - FIXED VERSION */}
            {showRejectModal && doctorToReject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-4">Reject Doctor Registration</h2>
                        <p className="text-gray-300 mb-4">
                            You are about to reject <span className="font-semibold text-white">{doctorToReject.name}'s</span> registration.
                        </p>
                        <div className="mb-6">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Reason for Rejection <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a detailed reason for rejection..."
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows="4"
                                maxLength="500"
                            />
                            <p className="text-gray-400 text-xs mt-1">
                                {rejectionReason.length}/500 characters
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setDoctorToReject(null);
                                    setRejectionReason('');
                                }}
                                disabled={submitting}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectDoctor}
                                disabled={submitting || !rejectionReason.trim()}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        Confirm Rejection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PendingDoctors;