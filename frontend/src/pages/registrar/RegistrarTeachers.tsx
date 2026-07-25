import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, UserPlus } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface Teacher {
    _id: string;
    name: string;
    email: string;
    subject: string;
    hireDate: string;
    phone: string;
    createdAt: string;
}

const RegistrarTeachers = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "password123",
        subject: "",
        hireDate: "",
        phone: "",
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/registrar/teachers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeachers(response.data.data || []);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching teachers:", error);
            setError(error.response?.data?.error || "Failed to load teachers");
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:7000/api/registrar/teachers', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            fetchTeachers();
            alert('✅ Teacher added successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to add teacher");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this teacher?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:7000/api/registrar/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTeachers();
            alert('✅ Teacher deleted successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to delete teacher");
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <DashboardLayout role="registrar">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading teachers...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="registrar">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Teacher Management</h1>
                        <p className="text-gray-500">Manage teacher records</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <UserPlus size={18} />
                        Add Teacher
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search teachers by name, email, or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Hire Date</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTeachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            {teachers.length === 0 ? "No teachers registered yet." : "No teachers match your search."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <tr key={teacher._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{teacher.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{teacher.email}</td>
                                            <td className="px-4 py-3">{teacher.subject || 'N/A'}</td>
                                            <td className="px-4 py-3">{teacher.hireDate ? new Date(teacher.hireDate).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDelete(teacher._id)}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                            <h2 className="text-xl font-bold mb-4">Add New Teacher</h2>
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
                                    type="text"
                                    placeholder="Subject (e.g., Mathematics)"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <input
                                    type="date"
                                    placeholder="Hire Date"
                                    value={formData.hireDate}
                                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Teacher</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default RegistrarTeachers;