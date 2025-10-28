import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const PatientAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [specialty, setSpecialty] = useState("");

    const token = localStorage.getItem("jwtToken"); // Get JWT token from localStorage
    const patientId = localStorage.getItem("patientid"); // Get patient ID from localStorage

    // Common fetch helper with Authorization header
    const fetchWithAuth = (url, options = {}, requireAuth = true) => {
        const headers = {
            "Content-Type": "application/json",
            ...(requireAuth && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        return fetch(url, { ...options, headers });
    };

    const fetchDoctors = (specialtyFilter = "") => {
        setLoading(true);
        let url = "http://localhost:8080/patient/doctors/getalldoctors";
        if (specialtyFilter) {
            url = `http://localhost:8080/patient/doctors/specialty/${specialtyFilter}`;
        }

        fetchWithAuth(url, {}, false)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Error: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setDoctors(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching doctors:", err);
                setLoading(false);
            });
    };


    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleSpecialtyChange = (e) => {
        const value = e.target.value;
        setSpecialty(value);
        fetchDoctors(value);
    };

    // 🔹 Find next available date
    const getNextAvailableDate = (availableDays) => {
        if (!availableDays || availableDays.length === 0) return null;

        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

            if (availableDays.includes(dayName)) {
                return date;
            }
        }
        return null;
    };

    // 🔹 Book appointment
    const bookAppointment = (doctor) => {
        const nextDate = getNextAvailableDate(doctor.availableDays);
        if (!nextDate) {
            alert("No available days found for this doctor!");
            console.log(patientId);
            console.log("Decoded JWT token:", decoded);
            return;
        }

        const [hours, minutes] = doctor.availableFrom.split(":");
        nextDate.setHours(hours);
        nextDate.setMinutes(minutes);

        const dateTimeString = nextDate.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss

        // fetchWithAuth("http://localhost:8080/appointments/create", {
        //     method: "POST",
        //     body: JSON.stringify({
        //         doctorId: doctor.id,
        //         patientId: patientId,
        //         dateTime: dateTimeString,
        //     }),
        // })
        //     .then((res) => {
        //         if (!res.ok) {
        //             throw new Error(`Error: ${res.status}`);
        //         }
        //         return res.json();
        //     })
        //     .then((data) => {
        //         alert(`Appointment booked for ${doctor.name} on ${nextDate}`);
        //         console.log("Appointment:", data);
        //     })
        //     .catch((err) => console.error("Error booking appointment:", err));
        fetchWithAuth("http://localhost:8080/appointments/create", {
            method: "POST",
            body: JSON.stringify({
                doctorId: doctor.id,
                patientId: patientId,
                dateTime: dateTimeString,
            }),
        })
            .then((res) => {
                if (!res.ok) {
                    return res.text().then((message) => {
                        throw new Error(message || `Error: ${res.status}`);
                    });
                }
                return res.json();
            })
            .then((data) => {
                alert(`✅ Appointment booked with ${doctor.name} on ${nextDate}`);
                console.log("Appointment:", data);
            })
            .catch((err) => {
                alert(`❌ Failed to book: ${err.message}`);
                console.error("Error booking appointment:", err);
            });
    };

    if (loading) {
        return (
            <p className="text-center mt-10 text-lg font-semibold">
                Loading doctors...
            </p>
        );
    }

    return (
        <div className="p-8">
            <div>
                <h3>Search for Doctors</h3>
                <select
                    value={specialty}
                    onChange={handleSpecialtyChange}
                    className="border border-gray-300 rounded-md p-2 mb-4"
                >
                    <option value="">All Specialties</option>
                    <option value="CARDIOLOGY">Cardiology</option>
                    <option value="DERMATOLOGY">Dermatology</option>
                    <option value="NEUROLOGY">Neurology</option>
                    <option value="PEDIATRICS">Pediatrics</option>
                    <option value="GENERAL_PHYSICIAN">General Physician</option>
                    <option value="ORTHOPEDICS">Orthopedics</option>
                    <option value="PSYCHIATRY">Psychiatry</option>
                    <option value="ONCOLOGY">Oncology</option>
                    <option value="GYNECOLOGY">Gynecology</option>
                    <option value="UROLOGY">Urology</option>
                    <option value="ENT">ENT</option>
                    <option value="GASTROENTEROLOGY">Gastroenterology</option>
                </select>
            </div>

            <h1 className="text-3xl font-bold mb-6 text-center">All Doctors</h1>

            {doctors.length === 0 ? (
                <p className="text-center text-gray-500">No doctors available.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white shadow-lg rounded-lg p-5 border border-grey-300 hover:shadow-2xl transition-shadow duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-green-700">{doc.name}</h2>
                                    <p className="text-blue-800 font-semibold">{doc.specialty}</p>
                                </div>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random`}
                                    alt={doc.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            </div>

                            <div className="mt-3">
                                <p><span className="font-semibold">Email:</span> {doc.email}</p>
                                <p><span className="font-semibold">Phone:</span> {doc.phone}</p>
                            </div>

                            <div className="mt-3">
                                <p>
                                    <span className="font-semibold text-blue-800">Available Days:</span>{" "}
                                    <span className="text-grey-600 font-semibold">{doc.availableDays?.join(", ")}</span>
                                </p>
                                <p>
                                    <span className="font-semibold text-blue-800">Time:</span>{" "}
                                    <span className="text-grey-600 font-semibold">{doc.availableFrom} - {doc.availableTo}</span>
                                </p>
                            </div>

                            <button
                                onClick={() => bookAppointment(doc)}
                                className="mt-4 w-full font-semibold bg-blue-600 hover:bg-blue-900 text-white px-4 py-2 rounded hover:transition-shadow duration-300"
                            >
                                Book Appointment
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientAppointment;
