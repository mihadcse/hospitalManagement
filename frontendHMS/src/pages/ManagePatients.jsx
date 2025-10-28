import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Eye, Search, RefreshCw, User } from 'lucide-react';

function ManagePatients() {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        // Ensure patients is an array before filtering
        if (Array.isArray(patients)) {
            const filtered = patients.filter(patient => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    patient?.name?.toLowerCase().includes(searchLower) ||
                    patient?.email?.toLowerCase().includes(searchLower) ||
                    patient?.phone?.includes(searchTerm) ||
                    patient?.id?.toString().includes(searchTerm)
                );
            });
            setFilteredPatients(filtered);
        }
    }, [searchTerm, patients]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching patients...');
            const response = await axios.get('http://localhost:8080/admin/patients', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response received:', response.data);

            // Ensure we're setting an array
            const data = Array.isArray(response.data) ? response.data : [];
            console.log('Setting patients:', data);

            setPatients(data);
            setFilteredPatients(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching patients:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);

            setError(
                err.response?.status === 401
                    ? 'Unauthorized. Please login again.'
                    : err.response?.data?.message || 'Failed to load patients'
            );

            // Set empty arrays on error to prevent map error
            setPatients([]);
            setFilteredPatients([]);
            setLoading(false);
        }
    };

    const handleViewDetails = async (patientId) => {
        try {
            console.log('Viewing patient:', patientId);
            const response = await axios.get(`http://localhost:8080/admin/patients/${patientId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Patient details:', response.data);
            setSelectedPatient(response.data);
            setShowModal(true);
        } catch (err) {
            console.error('Error loading patient details:', err);
            alert('Failed to load patient details: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeletePatient = async (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        const patientName = patient?.name || 'this patient';

        if (!window.confirm(`Are you sure you want to delete ${patientName}? This action cannot be undone.`)) {
            return;
        }

        try {
            console.log('Deleting patient:', patientId);
            await axios.delete(`http://localhost:8080/admin/patients/${patientId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            alert('Patient deleted successfully');
            fetchPatients(); // Refresh the list
        } catch (err) {
            console.error('Error deleting patient:', err);
            alert('Failed to delete patient: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl flex items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Loading patients...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                    <p className="font-semibold mb-2">Error Loading Patients</p>
                    <p>{error}</p>
                </div>
                <button
                    onClick={fetchPatients}
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
                    <h1 className="text-3xl font-bold text-white mb-2">Manage Patients</h1>
                    <p className="text-gray-400">
                        Total Patients: {patients.length}
                        {searchTerm && ` (${filteredPatients.length} filtered)`}
                    </p>
                </div>
                <button
                    onClick={fetchPatients}
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
                        placeholder="Search by name, email, phone, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Patients Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        {!Array.isArray(filteredPatients) || filteredPatients.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                    <User className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                                    <p>
                                        {searchTerm
                                            ? 'No patients found matching your search'
                                            : 'No patients registered yet'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {patient.id || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white font-medium">
                                        {patient.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {patient.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {patient.phone || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(patient.id)}
                                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDeletePatient(patient.id)}
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

            {/* Modal for Patient Details */}
            {showModal && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Patient Details</h2>

                        <div className="space-y-4 text-gray-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Patient ID</p>
                                    <p className="text-white font-semibold text-lg">
                                        {selectedPatient.id || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Full Name</p>
                                    <p className="text-white font-semibold text-lg">
                                        {selectedPatient.name || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Email Address</p>
                                    <p className="text-white font-semibold break-all">
                                        {selectedPatient.email || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Phone Number</p>
                                    <p className="text-white font-semibold text-lg">
                                        {selectedPatient.phone || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info Section */}
                            {selectedPatient.appointments && selectedPatient.appointments.length > 0 && (
                                <div className="border-t border-gray-700 pt-4 mt-4">
                                    <p className="text-gray-400 text-sm mb-2">Total Appointments</p>
                                    <p className="text-white font-semibold text-lg">
                                        {selectedPatient.appointments.length}
                                    </p>
                                </div>
                            )}
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
                                    handleDeletePatient(selectedPatient.id);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Patient
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManagePatients;