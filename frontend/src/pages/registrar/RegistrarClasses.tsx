import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, School } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface ClassData {
    _id: string;
    name: string;
    grade: string;
    section: string;
    academicYear: string;
    students: { _id: string; name: string }[];
    teacherIds: { _id: string; name: string }[];
    subjects: string[];
    createdAt: string;
}

const RegistrarClasses = () => {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [teachers, setTeachers] = useState<{ _id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        grade: "",
        section: "",
        academicYear: "2024/25",
        teacherIds: [] as string[],
        subjects: [] as string[],
    });

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/registrar/classes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(response.data.data || []);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching classes:", error);
            setError(error.response?.data?.error || "Failed to load classes");
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/registrar/teachers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeachers(response.data.data || []);
        } catch (error) {
            console.error("Error fetching teachers:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:7000/api/registrar/classes', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            fetchClasses();
            alert('✅ Class created successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to create class");
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="registrar">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading classes...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="registrar">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
                        <p className="text-gray-500">Create and manage school classes</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Create Class
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-gray-500 text-sm">Total Classes</p>
                        <h2 className="text-2xl font-bold">{classes.length}</h2>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-gray-500 text-sm">Total Students</p>
                        <h2 className="text-2xl font-bold">
                            {classes.reduce((sum, c) => sum + (c.students?.length || 0), 0)}
                        </h2>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-gray-500 text-sm">Total Teachers</p>
                        <h2 className="text-2xl font-bold">{teachers.length}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Grade</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Section</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Students</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Teachers</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Academic Year</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {classes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No classes created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    classes.map((cls) => (
                                        <tr key={cls._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{cls.name}</td>
                                            <td className="px-4 py-3">{cls.grade}</td>
                                            <td className="px-4 py-3">{cls.section}</td>
                                            <td className="px-4 py-3">{cls.students?.length || 0}</td>
                                            <td className="px-4 py-3">{cls.teacherIds?.length || 0}</td>
                                            <td className="px-4 py-3">{cls.academicYear}</td>
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
                            <h2 className="text-xl font-bold mb-4">Create New Class</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Class Name (e.g., Grade 10A)"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Grade (e.g., 10)"
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Section (e.g., A)"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Academic Year (e.g., 2024/25)"
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create Class</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default RegistrarClasses;