import { useState, useEffect } from "react";
import { Users, GraduationCap, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

interface Child {
    _id: string;
    name: string;
    email: string;
    class: string;
    age: number;
    parentName: string;
}

const ParentChildren = () => {
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchChildren() {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const userId = user?._id;

                if (!userId) {
                    setError("User not found");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `https://kamara-school-backend.onrender.com/api/parents/${userId}/children`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setChildren(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching children:", error);
                setError(getApiErrorMessage(error, "Failed to load children"));
                setLoading(false);
            }
        }

        fetchChildren();
    }, []);

    // ✅ Navigate to child's grades
    const viewGrades = (childId: string) => {
        navigate(`/parent/child/${childId}/grades`);
    };

    // ✅ Navigate to child's attendance
    const viewAttendance = (childId: string) => {
        navigate(`/parent/child/${childId}/attendance`);
    };

    if (loading) {
        return (
            <DashboardLayout role="parent">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500 dark:text-gray-400">Loading children...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="parent">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="parent">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Children</h1>
                    <p className="text-gray-500 dark:text-gray-400">View your children's academic progress</p>
                </div>

                {children.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                        <Users size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">No Children Linked</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Please contact the school registrar to link your children.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {children.map((child) => (
                            <div
                                key={child._id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer"
                                onClick={() => setSelectedChild(child)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                                        {child.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{child.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{child.class || 'No class'}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{child.email}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {/* ✅ View Grades Button - Navigates to grades page */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            viewGrades(child._id);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                                    >
                                        <GraduationCap size={14} /> View Grades
                                    </button>
                                    
                                    {/* ✅ View Attendance Button - Navigates to attendance page */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            viewAttendance(child._id);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition"
                                    >
                                        <ClipboardCheck size={14} /> View Attendance
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Child Details Modal */}
                {selectedChild && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">{selectedChild.name}</h2>
                            <div className="space-y-2">
                                <p className="dark:text-gray-200"><span className="font-medium">Email:</span> {selectedChild.email}</p>
                                <p className="dark:text-gray-200"><span className="font-medium">Class:</span> {selectedChild.class || 'N/A'}</p>
                                <p className="dark:text-gray-200"><span className="font-medium">Age:</span> {selectedChild.age || 'N/A'}</p>
                                <p className="dark:text-gray-200"><span className="font-medium">Parent:</span> {selectedChild.parentName || 'N/A'}</p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedChild(null);
                                        viewGrades(selectedChild._id);
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    View Grades
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedChild(null);
                                        viewAttendance(selectedChild._id);
                                    }}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    View Attendance
                                </button>
                                <button
                                    onClick={() => setSelectedChild(null)}
                                    className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ParentChildren;