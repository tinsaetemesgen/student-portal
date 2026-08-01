import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, UserPlus } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface Student {
    _id: string;
    name: string;
    email: string;
    class: string;
    age: number;
    parentName: string;
    parentPhone: string;
    createdAt: string;
}

const RegistrarStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "password123",
        class: "",
        age: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/registrar/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data.data || []);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching students:", error);
            setError(error.response?.data?.error || "Failed to load students");
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:7000/api/registrar/students', {
                ...formData,
                age: parseInt(formData.age),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            fetchStudents();
            alert('✅ Student registered successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to register student");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:7000/api/registrar/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStudents();
            alert('✅ Student deleted successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to delete student");
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.class && s.class.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <DashboardLayout role="registrar">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading students...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="registrar">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
                        <p className="text-gray-500">Register and manage student records</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <UserPlus size={18} />
                        Register Student
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search students by name, email, or class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Age</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Parent</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            {students.length === 0 ? "No students registered yet." : "No students match your search."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{student.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{student.email}</td>
                                            <td className="px-4 py-3">{student.class || 'N/A'}</td>
                                            <td className="px-4 py-3">{student.age || 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                {student.parentName ? `${student.parentName} (${student.parentPhone || 'N/A'})` : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDelete(student._id)}
                                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200"
                                                    >
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

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Register New Student</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />

<input
    type="password"
    placeholder="Password (default: password123)"
    value={formData.password}
    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    className="w-full border rounded-lg px-4 py-2"
    required
/>
                                <input
                                    type="text"
                                    placeholder="Class (e.g., Grade 10A)"
                                    value={formData.class}
                                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Age"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Parent Name"
                                    value={formData.parentName}
                                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Parent Phone"
                                    value={formData.parentPhone}
                                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                // Add Parent Email field
<input
    type="email"
    placeholder="Parent Email (for linking)"
    value={formData.parentEmail}
    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
    className="w-full border rounded-lg px-4 py-2"
/>
<input
    type="text"
    placeholder="Parent Name"
    value={formData.parentName}
    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
    className="w-full border rounded-lg px-4 py-2"
/>
<input
    type="text"
    placeholder="Parent Phone"
    value={formData.parentPhone}
    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
    className="w-full border rounded-lg px-4 py-2"
/>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Register</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default RegistrarStudents;