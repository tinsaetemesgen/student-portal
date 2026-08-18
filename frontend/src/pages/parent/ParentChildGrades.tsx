import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

interface Grade {
    _id: string;
    subject: string;
    score: number;
    grade: string;
    type: string;
    semester: string;
    academicYear: string;
    date: string;
    teacherId: { name: string };
}

interface Student {
    _id: string;
    name: string;
    email: string;
    class: string;
}

const ParentChildGrades = () => {
    const { childId } = useParams();
    const navigate = useNavigate();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem('token');
                
                const userRes = await axios.get(`https://kamara-school-backend.onrender.com/api/users/${childId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudent(userRes.data.data);

                const gradesRes = await axios.get(
                    `https://kamara-school-backend.onrender.com/api/grades/child/${childId}/grades`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setGrades(gradesRes.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(getApiErrorMessage(error, "Failed to load data"));
                setLoading(false);
            }
        }

        fetchData();
    }, [childId]);

    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            'A+': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            'A': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            'A-': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            'B+': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'B': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'B-': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'C+': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            'C': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            'C-': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            'D': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
            'F': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return colors[grade] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    };

    if (loading) {
        return (
            <DashboardLayout role="parent">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500 dark:text-gray-400">Loading grades...</div>
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
                <button
                    onClick={() => navigate('/parent/children')}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                    <ArrowLeft size={18} /> Back to Children
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{student?.name}'s Grades</h1>
                    <p className="text-gray-500 dark:text-gray-400">{student?.class} • {student?.email}</p>
                </div>

                {grades.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                        <GraduationCap size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">No Grades Available</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">No grades have been recorded for this student yet.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Subject</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Score</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Grade</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Teacher</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {grades.map((grade) => (
                                        <tr key={grade._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 font-medium">{grade.subject}</td>
                                            <td className="px-6 py-4 font-bold">{grade.score}%</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(grade.grade)}`}>
                                                    {grade.grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{grade.type}</td>
                                            <td className="px-6 py-4">{grade.teacherId?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                {new Date(grade.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ParentChildGrades;