import { useState, useEffect } from "react";
import { Users, UserPlus, BookOpen, GraduationCap, School, Plus, Edit2, Trash2 } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    class?: string;
    subject?: string;
}

interface ClassData {
    _id: string;
    name: string;
    grade: string;
    section: string;
    academicYear: string;
    students: UserData[];
    teacherIds: UserData[];
}

const RegistrarDashboard = () => {
    const [students, setStudents] = useState<UserData[]>([]);
    const [teachers, setTeachers] = useState<UserData[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch students
            const studentsRes = await axios.get('http://localhost:7000/api/registrar/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(studentsRes.data.data || []);

            // Fetch teachers
            const teachersRes = await axios.get('http://localhost:7000/api/registrar/teachers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeachers(teachersRes.data.data || []);

            // Fetch classes
            const classesRes = await axios.get('http://localhost:7000/api/registrar/classes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(classesRes.data.data || []);

            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching dashboard data:", error);
            setError(error.response?.data?.error || "Failed to load data");
            setLoading(false);
        }
    };

    const stats = [
        { title: "Total Students", value: students.length, icon: <Users size={24} className="text-blue-600" />, color: "bg-blue-50" },
        { title: "Total Teachers", value: teachers.length, icon: <UserPlus size={24} className="text-green-600" />, color: "bg-green-50" },
        { title: "Total Classes", value: classes.length, icon: <BookOpen size={24} className="text-purple-600" />, color: "bg-purple-50" },
    ];

    if (loading) {
        return (
            <DashboardLayout role="registrar">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading dashboard...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="registrar">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="registrar">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Registrar Dashboard</h1>
                    <p className="text-gray-500">Manage students, teachers, and class enrollment</p>
                    <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg inline-block">
                        ℹ️ Financial data is not visible in this dashboard
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.title} className={`${stat.color} p-5 rounded-xl shadow-sm flex items-center gap-4`}>
                            <div className="bg-white p-3 rounded-lg shadow-sm">{stat.icon}</div>
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <h2 className="text-2xl font-bold">{stat.value}</h2>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Student Management</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-3">
                                <Plus size={18} className="text-blue-600" />
                                <span>Register New Student</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3">
                                <Users size={18} className="text-gray-600" />
                                <span>View All Students</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3">
                                <Edit2 size={18} className="text-gray-600" />
                                <span>Update Student Records</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">👨‍🏫 Teacher & Class Management</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition flex items-center gap-3">
                                <Plus size={18} className="text-green-600" />
                                <span>Add New Teacher</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition flex items-center gap-3">
                                <School size={18} className="text-purple-600" />
                                <span>Create New Class</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3">
                                <BookOpen size={18} className="text-gray-600" />
                                <span>Assign Students to Classes</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Students & Teachers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Students</h3>
                        {students.slice(0, 5).length === 0 ? (
                            <p className="text-gray-500 text-sm">No students registered yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {students.slice(0, 5).map((student) => (
                                    <li key={student._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-gray-500">{student.class || 'No class'}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">{student.email}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Teachers</h3>
                        {teachers.slice(0, 5).length === 0 ? (
                            <p className="text-gray-500 text-sm">No teachers registered yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {teachers.slice(0, 5).map((teacher) => (
                                    <li key={teacher._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{teacher.name}</p>
                                            <p className="text-sm text-gray-500">{teacher.subject || 'No subject'}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">{teacher.email}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RegistrarDashboard;